import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { FeatureConfig } from "./FeatureConfig";
import { SSM } from "aws-sdk";
import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";
import { Parameter } from "aws-sdk/clients/ssm";
import { FeatureConfigModuleOptions, FeatureConfigModuleOptionsIoCAnchor } from "./FeatureConfigModuleOptions";

@Injectable()
export class FeatureConfigManager implements OnModuleInit, OnModuleDestroy {
  private featureConfigMap: Map<string, FeatureConfig> = new Map<string, FeatureConfig>();
  private redisClient?: WrappedNodeRedisClient;
  private redisSubscriptionClient?: WrappedNodeRedisClient;
  private readonly ssmClient?: SSM;

  getConfigValue(options: { configName: string }): any {
    let result;
    const featureConfigMap = this.getFeatureConfigMap();
    if (featureConfigMap.has(options.configName)) {
      const config = featureConfigMap.get(options.configName);
      if (config) {
        result = config;
      }
    }
    return result;
  }

  async reloadConfigValue(config: FeatureConfig): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.nodeRedis.publish("ReloadConfig", JSON.stringify(config));
    }
  }

  async updateFeatureConfig(config: FeatureConfig): Promise<void> {
    const key = config.path ? config.path + config.key : config.key;
    if (this.featureConfigMap.has(key)) {
      const config = this.featureConfigMap.get(key);
      if (this.ssmClient && config && !config.deprecated) {
        try {
          config.value = await this.ssmClient.getParameter({ Name: config.key, WithDecryption: true }).promise();
        } catch (error) {
          console.log(`Failed to fetch new value for config ${key} from parameter store`);
          throw new Error(`Failed to fetch new value for config ${key} from parameter store with error: ` + error);
        }
        this.featureConfigMap.set(key, config);
      }
    }
  }

  async initializeConfig(config: FeatureConfig): Promise<void> {
    const key = config.path ? config.path + config.key : config.key;
    if (!config.deprecated) {
      config.value = await this.fetchParameterValue(key);
    }
    this.featureConfigMap.set(key, config);
  }

  private async fetchParameterValue(key: string): Promise<string | undefined> {
    try {
      if (this.ssmClient) {
        return (await this.ssmClient.getParameter({ Name: key, WithDecryption: true }).promise()).Parameter?.Value;
      }
    } catch (error) {
      console.log(`Failed to fetch value from parameter store for key: ${key} with error: ${JSON.stringify(error)}`);
      throw new Error(
        `Failed to fetch value from parameter store for key: ${key} with error: ${JSON.stringify(error)}`
      );
    }
  }

  private getFeatureConfigMap(): Map<string, FeatureConfig> {
    return this.featureConfigMap;
  }

  private async initializeFeatureConfigs(configList: FeatureConfig[]): Promise<any> {
    this.initFeatureConfigMap(configList);
    if (this.ssmClient) {
      try {
        const featureConfigKeys = this.getFeatureConfigKeys();
        const values = await this.ssmClient
          .getParameters({
            Names: featureConfigKeys,
            WithDecryption: true,
          })
          .promise();
        const result = values.Parameters;
        result?.forEach((entry: Parameter) => {
          if (entry.Name && entry.Value) {
            const configName = entry.Name;
            const config = this.featureConfigMap.get(configName);
            if (config) {
              config.value = entry.Value;
              this.featureConfigMap.set(configName, config);
            }
          }
        });
      } catch (error) {
        console.log(`Failed to initialize config values`);
        throw new Error(`Failed to initialize config values with error: ` + error);
      }
    }
  }

  private initFeatureConfigMap(configList: FeatureConfig[]): void {
    configList.forEach((config: FeatureConfig) => {
      const key = config.path ? config.path + config.key : config.key;
      this.featureConfigMap.set(key, config);
    });
  }

  private getFeatureConfigKeys(): string[] {
    const configKeys: string[] = [];
    Array.from(this.featureConfigMap.values()).forEach((config) => {
      if (!config.deprecated) {
        configKeys.push(config.key);
      }
    });
    return configKeys;
  }

  async onModuleInit(): Promise<any> {
    await this.initializeFeatureConfigs(this.options.configList);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.redisSubscriptionClient) {
      await this.redisSubscriptionClient.quit();
    }
  }

  constructor(
    @Inject(FeatureConfigModuleOptionsIoCAnchor)
    private readonly options: FeatureConfigModuleOptions
  ) {
    if (options.SSM) {
      this.ssmClient = new SSM({
        accessKeyId: options.SSM.accessKeyId,
        secretAccessKey: options.SSM.secretAccessKey,
        region: options.SSM.region,
        ...(options.SSM.options ? options.SSM.options : {}),
      });
    }
    if (options.Redis) {
      this.redisClient = createNodeRedisClient(options.Redis.url);
      this.redisClient.nodeRedis.on("error", (error: any) => console.log(error));
      this.redisSubscriptionClient = createNodeRedisClient(options.Redis.url);
      this.redisSubscriptionClient.nodeRedis.on("error", (error: any) => console.log(error));
      this.redisSubscriptionClient.nodeRedis.subscribe("ReloadConfig", async (error: any, data: string) => {
        if (!error) await this.updateFeatureConfig(JSON.parse(data));
      });
    }
  }
}
