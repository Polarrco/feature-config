export class FeatureConfig {
  // Parameter store key
  key!: string;

  // Parameter store path for the key, should have leading and ending forward slashes, like this: /a/b/
  path?: string;

  // Boolean flag to track whether the config is still being used. If true, then value is fetched from SSM, else default value is used.
  deprecated?: boolean = false;

  // A default value assigned to the key
  value?: any;

  constructor(options: { key: string; value?: any; path?: string; deprecated?: boolean }) {
    this.key = options.key;
    this.value = options.value;
    this.path = options.path;
    this.deprecated = options.deprecated;
  }
}
