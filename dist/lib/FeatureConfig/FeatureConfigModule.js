"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FeatureConfigModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureConfigModule = void 0;
const common_1 = require("@nestjs/common");
const FeatureConfigManager_1 = require("./FeatureConfigManager");
const FeatureConfigModuleOptions_1 = require("./FeatureConfigModuleOptions");
let FeatureConfigModule = FeatureConfigModule_1 = class FeatureConfigModule {
    static forRoot(options) {
        return {
            module: FeatureConfigModule_1,
            providers: [
                {
                    provide: FeatureConfigModuleOptions_1.FeatureConfigModuleOptionsIoCAnchor,
                    useValue: options,
                },
                FeatureConfigManager_1.FeatureConfigManager,
            ],
            exports: [FeatureConfigManager_1.FeatureConfigManager],
        };
    }
    static forRootAsync(options) {
        return {
            module: FeatureConfigModule_1,
            providers: [
                {
                    provide: FeatureConfigModuleOptions_1.FeatureConfigModuleOptionsIoCAnchor,
                    useFactory: async () => {
                        return await options;
                    },
                },
                FeatureConfigManager_1.FeatureConfigManager,
            ],
            exports: [FeatureConfigManager_1.FeatureConfigManager],
        };
    }
};
FeatureConfigModule = FeatureConfigModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({
        providers: [FeatureConfigManager_1.FeatureConfigManager],
    })
], FeatureConfigModule);
exports.FeatureConfigModule = FeatureConfigModule;
//# sourceMappingURL=FeatureConfigModule.js.map