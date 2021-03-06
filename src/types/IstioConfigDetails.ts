import Namespace from './Namespace';
import { AceOptions } from 'react-ace';
import { ResourcePermissions } from './Permissions';
import {
  DestinationPolicy,
  DestinationRule,
  Gateway,
  IstioAdapter,
  IstioRule,
  IstioTemplate,
  Policy,
  QuotaSpec,
  QuotaSpecBinding,
  RouteRule,
  ServiceEntry,
  VirtualService,
  ObjectValidation
} from './IstioObjects';

export interface IstioConfigId {
  namespace: string;
  objectType: string;
  objectSubtype: string;
  object: string;
}

export interface IstioConfigDetails {
  namespace: Namespace;
  gateway: Gateway;
  routeRule: RouteRule;
  destinationPolicy: DestinationPolicy;
  virtualService: VirtualService;
  destinationRule: DestinationRule;
  serviceEntry: ServiceEntry;
  rule: IstioRule;
  adapter: IstioAdapter;
  template: IstioTemplate;
  quotaSpec: QuotaSpec;
  quotaSpecBinding: QuotaSpecBinding;
  policy: Policy;
  permissions: ResourcePermissions;
  validation: ObjectValidation;
}

export const aceOptions: AceOptions = {
  showPrintMargin: false,
  autoScrollEditorIntoView: true
};

export const safeDumpOptions = {
  styles: {
    '!!null': 'canonical' // dump null as ~
  }
};

export interface ParsedSearch {
  type?: string;
  name?: string;
}
