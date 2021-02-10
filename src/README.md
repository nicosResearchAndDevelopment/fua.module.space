# module.Space

> __Thoughts (SPE):__
> 
> From the current implementation it is unclear, what the purpose and the functional principle 
> of this module is. It seems to be a wrapper around a _Map_, called the _graph_. It has some extended
> methods to store data in this graph and get it back. Data is meant to be in the format of JSON objects
> with an _@id_ attribute. Maybe the map is just a substitute for a real _persistence store_, but it cannot
> show the mechanics that are involved in updating and retrieving data in a database. Also, the differentiation 
> between _map_, _weaktypes_ and _weaknodes_ is a bit confusing.
> 
> The assumption of storing all data in RAM will just not work. In fact the assumption has to be made, that barely 
> any data can be held in RAM. In my opinion, _types_ are the only kind of data suited to be held in a _dataset_ 
> rather than being held in a _store_. 
> 
> Currently, the _model_ methods from _IM_ are responsible for creating and structuring the _nodes_ that should 
> be managed by the _space_, although I cannot see the connection, where those nodes have the ability to store
> or retrieve any data, as they have no reference to the space at all. They can only be added by other methods
> and would update automatically in the map if changed, which again is not the case with databases.
> 
> Also, the only method for reading actual data from disk is the __load__ function, but it seems that the dataset, 
> as the main point of interest here, is never used anywhere to create nodes and has no connection to the models.
> I consider the space a really complex module, because it plays an important role and has many duties. That is the
> reason why I do not want to judge the current implementation, though it has many flaws.
> To sum up the responsibilities the space has in my opinion:
> 
> - Manage a persistence store. (The store itself could be a manager of stores, but has the same interface.)
> - Manage a dataset with permanently loaded types. (Probably read once from disk.)
> - Differentiate between data and types.
> - Manage the creation of resources/nodes with the appropriate type and data. (Maybe with models.)
> - Be the entrypoint for every CRUD operation on resources in the store.
> - Implement a transition from convenient resource nodes to/from quads for datasets and stores.
> - Cache nodes, merge changes and organize access and TTLs.
> - Have a consistent data model to prevent inconsistent behaviour. (Do not accept custom nodes.)
> - Be able to update single data points as well as huge datasets. (Minimize redundant operations.)
> - Notify resources and other listeners via events on data updates.
> - Prevent memory leaks and RAM overload. (Also reduce RAM usage as much as possible.)
> - Have documented and easy to understand code without unnecessary extras. (Also a ton of mocha tests.)
> 
> All in all, if we want to have a chance of getting the space right in whatever way we want or decide,
> we must definitely describe our interface and the reasons for our decision in detail, before we start implementing
> anything. Otherwise, no one will be able to rely on this module and maintain it in the future.

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
        // does nothing for the space, only returns the data
    add(nodes: Node | Array<Node>): Promise<{ error: null | { '@id': string, 'fua:ts': number, message: string }, 
        report: Array<string>, added: Array<Node>, existing: Array<Node>, bads: Array<Node> }>; // async for no reason
        // as demonstration it is insufficient, because it does not show the case of manimulating and merging nodes
    has(node: Node): boolean;
    get(nodes: Node | string | Array<Node | string>): Array<Node>; // not necessarily the same length as input
    filter(fn: (node: Node) => Promise<boolean>): Promise<Array<Node>>; // only async because of the filter function
};
```