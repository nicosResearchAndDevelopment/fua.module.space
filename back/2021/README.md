# module.space

## Interface

```ts
interface Node {
    '@id': string;
};

interface Literal {
    '@value': string;
    '@language'?: string;
    '@type'?: string;
};

interface Resource extends Node {
    space: Space;
    '@id': string;
    '@type'?: Array<string>;
    [key: string]: Array<Node|Literal>
    clear(): this;
    assign(data: Dataset): this;
    extract(): Dataset;
    create(): Promise<boolean>;
    read(): Promise<Dataset|false>;
    update(): Promise<boolean>;
    delete(): Promise<boolean>;
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
    localData: Dataset;
    dataStore: DataStore;
    load(param: LoadConfig): Promise<void>;
    // nodes: Map<string, Resource>;
    getNode(id: string | {"@id": string}): Resource;
};
```