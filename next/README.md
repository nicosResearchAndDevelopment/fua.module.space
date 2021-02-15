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

interface Node {
    '@id': string;
};

interface CrudResult {
    subject: NamedNode;
    success: boolean;
    error?: Error;
    node?: Node;
};

interface Space {
    data: Dataset;
    store: DataStore;
    load(param: LoadConfig): Promise<void>;
    // TODO
    create(node: Node | Array<Node>): Promise<CrudResult | Array<CrudResult>>
    read(node: string | Node | Array<string | Node>): Promise<CrudResult | Array<CrudResult>>
    update(node: Node | Array<Node>): Promise<CrudResult | Array<CrudResult>>
    delete(node: string | Node | Array<string | Node>): Promise<CrudResult | Array<CrudResult>>
};
```