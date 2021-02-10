# module.Space

## module.Space

```ts
interface Node {
    '@id': string;
};

interface Weaktypes {
    // cannot work, because a weakmap cannot manage string keys
    weaktypes: WeakMap; // must get its weaktypes on construction
    has(type: Node | string): boolean; // will only work with a regular map
};

interface Space {
    weaktypes: Weaktypes;
    context: null | Object;
    addContext(prefix: string, context: Object): void; // not implemented
    spread(id: string): { id: string, '@prefix': string, tail: string, uri: string };
    set(resource: Node, persistence: boolean): Promise; // cannot work at all
    has(key: string): boolean;
    get(key: Array<Node | string>): Array<Node>; // does not work
    filter(expression): Promise<{ '@graph': Array, ts: number }>; // does not work
    map: Map<string, Node>;
    keys: Array<string>; // getter for the keys of the map
    nodes: Array<Node>; // getter for the values of the map
    weaknodes: WeakMap;
};
```

## module.Space.beta

```ts
interface Node {
    '@id': string;
};

interface Weaktypes {
    // cannot work, because a weakmap cannot manage string keys
    // i guess it is just used as a wrapper around a regular map
    weaktypes: WeakMap; // must get its weaktypes on construction
    has(type: Node | string): boolean; // will only work with a regular map
    get(types: Node | string | Array<Node | string>): Array<node>; // will only work with a regular map
};

interface Weaknodes {
    // same issues as weaktypes
    weaknodes: WeakMap;
    set(types: Node | string | Array<Node | string>): void;
    has(type: Node | string): boolean;
    get(types: Node | string | Array<Node | string>): Array<node>;
};

interface SpaceBeta {
    '@context': null | Object; // does nothing
    root: string; // only as uuid prefix
    map: Map<string, Node>; // manages all nodes in the space
    '@graph': Array<Node>; // getter for the values of the map
    URIs: Array<string>; // getter for the keys of the map
    IM: null | Object; // never used, has a one-time setter
    weaktypes: Weaktypes;
    weaknodes: Weaknodes;
    load(param: { '@context': Object, '@id': string, '@type': string, 'rdfs:label': string, 'fua:dop': boolean, 
             'fua:verbose': string, dataset: Dataset, shapesset: Dataset, index: Set<string>, 'fua:load': Array<string> }): 
        Promise<{ hasBeginning: number, startedAt: string, dataset: Dataset, shapeset: Dataset, endedAt: string }>;
    add(nodes: Node | Array<Node>): Promise<{ error: null | { '@id': string, 'fua:ts': number, message: string }, 
        report: Array<string>, added: Array<Node>, existing: Array<Node>, bads: Array<Node> }>; // async for no reason
    has(node: Node): boolean;
    get(nodes: Node | string | Array<Node | string>): Array<Node>; // not necessarily the same length as input
    filter(fn: (node: Node) => Promise<boolean>): Promise<Array<Node>>; // only async because of the filter function
};
```