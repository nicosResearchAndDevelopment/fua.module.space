# module.space

### Questions to answer:

- What is the lifecycle of a resource node?
- On what occasion in the process of the app will they be created?
    - Nodes must be created, if not already existing, at least on usage of another application.
- What is the purpose of these nodes, where will they be used?
    - The purpose is an easy and convenient usage of the data store.
    - Applications like PEP, LDP, AMEC or TRACL should be able to access or update data.
    - The usage of these nodes should make data handling more consistent, convenient and reduce errors.
- Will they be cached and what is the condition for creating them?
    - If possible, the internal garbage collector should handle removing of not needed nodes.
    - Making references weak might be the key to archive garbage collection.
- How long will they stay or how long can they be used?
- What is the condition or mechanism to remove them?
- How is it possible to reference another resource node?
- What data is needed to create them and where does the data come from?
    - Data might come directly from the store to enrich the node.
    - Data might not be available because the node does not exist yet. In that case the node must be created empty.
- How can a node be manipulated and how are updates synchronized with the data then?
    - With `process.nextTick()` the current synchronous changes could be determined and synced after that.
    - Synchronizing should only occur on an explizit update call to bundle changes together.
    - If no update gets called, the synchronous changes might get discarded.
    - The node cannot be manipulated directly, but with methods designed with sync mechanics in mind.
    - Manipulation of nodes cannot be synchronous only, because relied on data might get queried late.
    - But maybe changes can be tracked synchronous without knowing relied on data and then synced later.
- Does the current state of a node reflect the state of the data and how to tell the difference?
    - The nodes need to track the currently persistent state and the changes that needs to be made.
- Does a resource node need access to the space to update its data?
- How to differentiate between actual data nodes, which have a corresponding resource or entry in a database, and
  temporary nodes, which are created by the process to eventually make them persist?
- Can resource nodes be created outside the space and later be added?
    - I do not think it would be good practice to created nodes outside this model and add them later. It would only
      introduce potential for more errors.
    - In that case, a solution would not be dependent on spezial nodes with customized functions and could only
      implement parsers to/from dataset representation. But this might introduce race conditions which would be
      impossible to debug.
- If a resource node has references to a blank node, how will the data be merged on an update?
    - If the data has been loaded earlier, the blank node id would be known. In the case that a blank node update on a
      node occurs without having created this node beforehand, a merge would be indistinguishable from a new blank node.


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