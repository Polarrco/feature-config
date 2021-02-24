"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureConfig = void 0;
class FeatureConfig {
    constructor(options) {
        this.deprecated = false;
        this.key = options.key;
        this.value = options.value;
        this.path = options.path;
        this.deprecated = options.deprecated;
    }
}
exports.FeatureConfig = FeatureConfig;
//# sourceMappingURL=FeatureConfig.js.map