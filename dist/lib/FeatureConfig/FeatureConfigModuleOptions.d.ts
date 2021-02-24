import { FeatureConfig } from "./FeatureConfig";
interface OptionsForFeatureConfig {
  SSM?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    options?: Record<string, any>;
  };
  Redis?: {
    url: string;
  };
  configList: FeatureConfig[];
}
export declare type FeatureConfigModuleOptions = OptionsForFeatureConfig;
export declare const FeatureConfigModuleOptionsIoCAnchor: unique symbol;
export {};
//# sourceMappingURL=FeatureConfigModuleOptions.d.ts.map
