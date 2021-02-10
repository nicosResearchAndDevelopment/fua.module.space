# module.space

## Interface

```ts
interface LoadConfig {
    'dct:identifier': string;
    'dct:format': string;
    'dct:title'?: string;
    'dct:alternative'?: string;
    'dct:requires'?: Array<LoadConfig>;
};

interface Space {
    load(param: LoadConfig): Promise<void>;
    // TODO
};
```