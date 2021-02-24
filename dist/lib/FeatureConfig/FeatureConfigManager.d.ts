import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { FeatureConfig } from "./FeatureConfig";
import { FeatureConfigModuleOptions } from "./FeatureConfigModuleOptions";
export declare class FeatureConfigManager implements OnModuleInit, OnModuleDestroy {
  private readonly options;
  private featureConfigMap;
  private redisClient?;
  private redisSubscriptionClient?;
  private readonly ssmClient?;
  getConfigValue(options: { configName: string }): any;
  reloadConfigValue(config: FeatureConfig): Promise<void>;
  updateFeatureConfig(config: FeatureConfig): Promise<void>;
  initializeConfig(config: FeatureConfig): Promise<void>;
  private fetchParameterValue;
  private getFeatureConfigMap;
  private initializeFeatureConfigs;
  private initFeatureConfigMap;
  private getFeatureConfigKeys;
  onModuleInit(): Promise<any>;
  onModuleDestroy(): Promise<void>;
  constructor(options: FeatureConfigModuleOptions);
}
//# sourceMappingURL=FeatureConfigManager.d.ts.map
