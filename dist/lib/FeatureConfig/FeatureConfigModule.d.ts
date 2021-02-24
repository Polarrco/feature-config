import { DynamicModule } from "@nestjs/common";
import { FeatureConfigModuleOptions } from "./FeatureConfigModuleOptions";
export declare class FeatureConfigModule {
  static forRoot(options: FeatureConfigModuleOptions): DynamicModule;
  static forRootAsync(options: Promise<FeatureConfigModuleOptions>): DynamicModule;
}
//# sourceMappingURL=FeatureConfigModule.d.ts.map
