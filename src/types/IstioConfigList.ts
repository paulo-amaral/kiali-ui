import Namespace from './Namespace';
import {
  DestinationRule,
  DestinationRules,
  Gateway,
  IstioAdapter,
  IstioRule,
  IstioTemplate,
  ObjectValidation,
  Policy,
  QuotaSpec,
  QuotaSpecBinding,
  ServiceEntry,
  VirtualService,
  VirtualServices,
  Validations
} from './IstioObjects';
import { ResourcePermissions } from './Permissions';

export interface IstioConfigItem {
  namespace: string;
  type: string;
  name: string;
  gateway?: Gateway;
  virtualService?: VirtualService;
  destinationRule?: DestinationRule;
  serviceEntry?: ServiceEntry;
  rule?: IstioRule;
  adapter?: IstioAdapter;
  template?: IstioTemplate;
  quotaSpec?: QuotaSpec;
  quotaSpecBinding?: QuotaSpecBinding;
  policy?: Policy;
  validation?: ObjectValidation;
}

export interface IstioConfigList {
  namespace: Namespace;
  gateways: Gateway[];
  virtualServices: VirtualServices;
  destinationRules: DestinationRules;
  serviceEntries: ServiceEntry[];
  rules: IstioRule[];
  adapters: IstioAdapter[];
  templates: IstioTemplate[];
  quotaSpecs: QuotaSpec[];
  quotaSpecBindings: QuotaSpecBinding[];
  policies: Policy[];
  permissions: { [key: string]: ResourcePermissions };
  validations: Validations;
}

export interface IstioService {
  name: string;
  namespace?: string;
  domain?: string;
  service?: string;
  labels?: { [key: string]: string };
}

export const dicIstioType = {
  Gateway: 'gateways',
  VirtualService: 'virtualservices',
  DestinationRule: 'destinationrules',
  ServiceEntry: 'serviceentries',
  Rule: 'rules',
  Adapter: 'adapters',
  Template: 'templates',
  QuotaSpec: 'quotaspecs',
  QuotaSpecBinding: 'quotaspecbindings',
  Policy: 'policies',
  gateways: 'Gateway',
  virtualservices: 'VirtualService',
  destinationrules: 'DestinationRule',
  serviceentries: 'ServiceEntry',
  rules: 'Rule',
  adapters: 'Adapter',
  templates: 'Template',
  quotaspecs: 'QuotaSpec',
  quotaspecbindings: 'QuotaSpecBinding',
  instance: 'Instance',
  handler: 'Handler',
  policies: 'Policy'
};

const includeName = (name: string, names: string[]) => {
  for (let i = 0; i < names.length; i++) {
    if (name.includes(names[i])) {
      return true;
    }
  }
  return false;
};

export const filterByName = (unfiltered: IstioConfigList, names: string[]): IstioConfigList => {
  if (names && names.length === 0) {
    return unfiltered;
  }
  return {
    namespace: unfiltered.namespace,
    gateways: unfiltered.gateways.filter(gw => includeName(gw.metadata.name, names)),
    virtualServices: {
      permissions: unfiltered.virtualServices.permissions,
      items: unfiltered.virtualServices.items.filter(vs => includeName(vs.metadata.name, names))
    },
    destinationRules: {
      permissions: unfiltered.destinationRules.permissions,
      items: unfiltered.destinationRules.items.filter(dr => includeName(dr.metadata.name, names))
    },
    serviceEntries: unfiltered.serviceEntries.filter(se => includeName(se.metadata.name, names)),
    rules: unfiltered.rules.filter(r => includeName(r.metadata.name, names)),
    adapters: unfiltered.adapters.filter(r => includeName(r.metadata.name, names)),
    templates: unfiltered.templates.filter(r => includeName(r.metadata.name, names)),
    quotaSpecs: unfiltered.quotaSpecs.filter(qs => includeName(qs.metadata.name, names)),
    quotaSpecBindings: unfiltered.quotaSpecBindings.filter(qsb => includeName(qsb.metadata.name, names)),
    policies: unfiltered.policies.filter(p => includeName(p.metadata.name, names)),
    validations: unfiltered.validations,
    permissions: unfiltered.permissions,
  };
};

export const filterByConfigValidation = (unfiltered: IstioConfigItem[], configFilters: string[]): IstioConfigItem[] => {
  if (configFilters && configFilters.length === 0) {
    return unfiltered;
  }
  const filtered: IstioConfigItem[] = [];

  const filterByValid = configFilters.indexOf('Valid') > -1;
  const filterByNotValid = configFilters.indexOf('Not Valid') > -1;
  const filterByNotValidated = configFilters.indexOf('Not Validated') > -1;
  const filterByWarning = configFilters.indexOf('Warning') > -1;
  if (filterByValid && filterByNotValid && filterByNotValidated && filterByWarning) {
    return unfiltered;
  }

  unfiltered.forEach(item => {
    if (filterByValid && item.validation && item.validation.valid) {
      filtered.push(item);
    }
    if (filterByNotValid && item.validation && !item.validation.valid) {
      filtered.push(item);
    }
    if (filterByNotValidated && !item.validation) {
      filtered.push(item);
    }
    if (filterByWarning && item.validation && item.validation.checks.filter(i => i.severity === 'warning').length > 0) {
      filtered.push(item);
    }
  });
  return filtered;
};

export const toIstioItems = (istioConfigList: IstioConfigList): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];

  const hasValidations = (type: string, name: string) =>
    istioConfigList.validations[type] && istioConfigList.validations[type][name];

  istioConfigList.gateways.forEach(gw =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'gateway',
      name: gw.metadata.name,
      gateway: gw,
      validation: hasValidations('gateway', gw.metadata.name)
        ? istioConfigList.validations['gateway'][gw.metadata.name]
        : undefined
    })
  );
  istioConfigList.virtualServices.items.forEach(vs =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'virtualservice',
      name: vs.metadata.name,
      virtualService: vs,
      validation: hasValidations('virtualservice', vs.metadata.name)
        ? istioConfigList.validations['virtualservice'][vs.metadata.name]
        : undefined
    })
  );
  istioConfigList.destinationRules.items.forEach(dr =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'destinationrule',
      name: dr.metadata.name,
      destinationRule: dr,
      validation: hasValidations('destinationrule', dr.metadata.name)
        ? istioConfigList.validations['destinationrule'][dr.metadata.name]
        : undefined
    })
  );
  istioConfigList.serviceEntries.forEach(se =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'serviceentry',
      name: se.metadata.name,
      serviceEntry: se,
      validation: hasValidations('serviceentry', se.metadata.name)
        ? istioConfigList.validations['serviceentry'][se.metadata.name]
        : undefined
    })
  );
  istioConfigList.rules.forEach(r =>
    istioItems.push({ namespace: istioConfigList.namespace.name, type: 'rule', name: r.metadata.name, rule: r })
  );
  istioConfigList.adapters.forEach(a =>
    istioItems.push({ namespace: istioConfigList.namespace.name, type: 'adapter', name: a.metadata.name, adapter: a })
  );
  istioConfigList.templates.forEach(t =>
    istioItems.push({ namespace: istioConfigList.namespace.name, type: 'template', name: t.metadata.name, template: t })
  );
  istioConfigList.quotaSpecs.forEach(qs =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'quotaspec',
      name: qs.metadata.name,
      quotaSpec: qs
    })
  );
  istioConfigList.quotaSpecBindings.forEach(qsb =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'quotaspecbinding',
      name: qsb.metadata.name,
      quotaSpecBinding: qsb
    })
  );
  istioConfigList.policies.forEach(p =>
    istioItems.push({
      namespace: istioConfigList.namespace.name,
      type: 'policy',
      name: p.metadata.name,
      policy: p
    })
  );
  return istioItems;
};
