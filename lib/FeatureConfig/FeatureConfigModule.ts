import { DynamicModule, Global, Module } from "@nestjs/common";
import { FeatureConfigManager } from "./FeatureConfigManager";
import { FeatureConfigModuleOptions, FeatureConfigModuleOptionsIoCAnchor } from "./FeatureConfigModuleOptions";

@Global()
@Module({
  providers: [FeatureConfigManager],
})
export class FeatureConfigModule {
  static forRoot(options: FeatureConfigModuleOptions): DynamicModule {
    return {
      module: FeatureConfigModule,
      providers: [
        {
          provide: FeatureConfigModuleOptionsIoCAnchor,
          useValue: options,
        },
        FeatureConfigManager,
      ],
      exports: [FeatureConfigManager],
    };
  }

  static forRootAsync(options: Promise<FeatureConfigModuleOptions>): DynamicModule {
    return {
      module: FeatureConfigModule,
      providers: [
        {
          provide: FeatureConfigModuleOptionsIoCAnchor,
          useFactory: async (): Promise<FeatureConfigModuleOptions> => {
            return await options;
          },
        },
        FeatureConfigManager,
      ],
      exports: [FeatureConfigManager],
    };
  }
}
