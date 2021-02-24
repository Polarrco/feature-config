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

export type FeatureConfigModuleOptions = OptionsForFeatureConfig;

export const FeatureConfigModuleOptionsIoCAnchor = Symbol("FeatureConfigModuleOptionsIoCAnchor");
