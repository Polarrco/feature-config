"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureConfigManager = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const handy_redis_1 = require("handy-redis");
const FeatureConfigModuleOptions_1 = require("./FeatureConfigModuleOptions");
let FeatureConfigManager = class FeatureConfigManager {
    constructor(options) {
        this.options = options;
        this.featureConfigMap = new Map();
        if (options.SSM) {
            this.ssmClient = new aws_sdk_1.SSM({
                accessKeyId: options.SSM.accessKeyId,
                secretAccessKey: options.SSM.secretAccessKey,
                region: options.SSM.region,
                ...(options.SSM.options ? options.SSM.options : {}),
            });
        }
        if (options.Redis) {
            this.redisClient = handy_redis_1.createNodeRedisClient(options.Redis.url);
            this.redisClient.nodeRedis.on("error", (error) => console.log(error));
            this.redisSubscriptionClient = handy_redis_1.createNodeRedisClient(options.Redis.url);
            this.redisSubscriptionClient.nodeRedis.on("error", (error) => console.log(error));
            this.redisSubscriptionClient.nodeRedis.subscribe("ReloadConfig", async (error, data) => {
                if (!error)
                    await this.updateFeatureConfig(JSON.parse(data));
            });
        }
    }
    getConfigValue(options) {
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
    async reloadConfigValue(config) {
        if (this.redisClient) {
            await this.redisClient.nodeRedis.publish("ReloadConfig", JSON.stringify(config));
        }
    }
    async updateFeatureConfig(config) {
        const key = config.path ? config.path + config.key : config.key;
        if (this.featureConfigMap.has(key)) {
            if (this.ssmClient && config && !config.deprecated) {
                try {
                    config.value = await this.ssmClient.getParameter({ Name: config.key, WithDecryption: true }).promise();
                }
                catch (error) {
                    console.log(`Failed to fetch new value for config ${key} from parameter store`);
                    throw new Error(`Failed to fetch new value for config ${key} from parameter store with error: ` + error);
                }
                this.featureConfigMap.set(key, config);
            }
        }
    }
    async initializeConfig(config) {
        const key = config.path ? config.path + config.key : config.key;
        if (!config.deprecated) {
            config.value = await this.fetchParameterValue(key);
        }
        this.featureConfigMap.set(key, config);
    }
    async fetchParameterValue(key) {
        var _a;
        try {
            if (this.ssmClient) {
                return (_a = (await this.ssmClient.getParameter({ Name: key, WithDecryption: true }).promise()).Parameter) === null || _a === void 0 ? void 0 : _a.Value;
            }
        }
        catch (error) {
            console.log(`Failed to fetch value from parameter store for key: ${key} with error: ${JSON.stringify(error)}`);
            throw new Error(`Failed to fetch value from parameter store for key: ${key} with error: ${JSON.stringify(error)}`);
        }
    }
    getFeatureConfigMap() {
        return this.featureConfigMap;
    }
    async initializeFeatureConfigs(configList) {
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
                result === null || result === void 0 ? void 0 : result.forEach((entry) => {
                    if (entry.Name && entry.Value) {
                        const configName = entry.Name;
                        const config = this.featureConfigMap.get(configName);
                        if (config) {
                            config.value = entry.Value;
                            this.featureConfigMap.set(configName, config);
                        }
                    }
                });
            }
            catch (error) {
                console.log(`Failed to initialize config values`);
                throw new Error(`Failed to initialize config values with error: ` + error);
            }
        }
    }
    initFeatureConfigMap(configList) {
        configList.forEach((config) => {
            const key = config.path ? config.path + config.key : config.key;
            this.featureConfigMap.set(key, config);
        });
    }
    getFeatureConfigKeys() {
        const configKeys = [];
        Array.from(this.featureConfigMap.values()).forEach((config) => {
            if (!config.deprecated) {
                configKeys.push(config.key);
            }
        });
        return configKeys;
    }
    async onModuleInit() {
        await this.initializeFeatureConfigs(this.options.configList);
    }
    async onModuleDestroy() {
        if (this.redisClient) {
            await this.redisClient.quit();
        }
        if (this.redisSubscriptionClient) {
            await this.redisSubscriptionClient.quit();
        }
    }
};
FeatureConfigManager = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(FeatureConfigModuleOptions_1.FeatureConfigModuleOptionsIoCAnchor)),
    __metadata("design:paramtypes", [Object])
], FeatureConfigManager);
exports.FeatureConfigManager = FeatureConfigManager;
//# sourceMappingURL=FeatureConfigManager.js.map