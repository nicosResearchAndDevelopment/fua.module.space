# module.space

## Interface

```ts
interface Literal {
    '@value': string;
    '@language'?: string;
    '@type'?: string;
};

interface Resource {
    space: Space;
    '@id': string;
    '@type'?: Array<string>;
    clear(): void;
    create(): Promise<boolean>;
    read(): Promise<boolean>;
    update(): Promise<boolean>;
    delete(): Promise<boolean>;
};

interface Model extends Resource {
    build(resource: Resource): void;
};

interface LoadConfig {
    'dct:identifier': string;
    'dct:format': string;
    'dct:title'?: string;
    'dct:alternative'?: string;
    'dct:requires'?: Array<LoadConfig>;
};

interface Space {
    factory: DataFactory;
    data: Dataset;
    store: DataStore;
    load(param: LoadConfig): Promise<void>;
    nodes: Map<string, Resource>;
    setModel(id: string, builder: (resource: Resource) => void): Model;
    getNode(id): Resource;
};
```