# fua.module.space

### Thoughts (SPE):

From the current implementation it is unclear, what the purpose and the functional principle of this module is. It seems
to be a wrapper around a _Map_, called the _graph_. It has some extended methods to store data in this graph and get it
back. Data is meant to be in the format of JSON objects with an _@id_ attribute. Maybe the map is just a substitute for
a real _persistence store_, but it cannot show the mechanics that are involved in updating and retrieving data in a
database. Also, the differentiation between _map_, _weaktypes_ and _weaknodes_ is a bit confusing.

The assumption of storing all data in RAM will just not work. In fact the assumption has to be made, that barely any
data can be held in RAM. In my opinion, _types_ are the only kind of data suited to be held in a _dataset_
rather than being held in a _store_.

Currently, the _model_ methods from _IM_ are responsible for creating and structuring the _nodes_ that should be managed
by the _space_, although I cannot see the connection, where those nodes have the ability to store or retrieve any data,
as they have no reference to the space at all. They can only be added by other methods and would update automatically in
the map if changed, which again is not the case with databases.

Also, the only method for reading actual data from disk is the _load_ function, but it seems that the dataset, as the
main point of interest here, is never used anywhere to create nodes and has no connection to the models. I consider the
space a really complex module, because it plays an important role and has many duties. That is the reason why I do not
want to judge the current implementation, though it has many flaws. To sum up the responsibilities the space has in my
opinion:

- Manage a persistence store. (The store itself could be a manager of stores, but has the same interface.)
- Manage a dataset with permanently loaded types. (Probably read once from disk.)
- Use a standardized format for loading data. (Load scripts should also avoid to make up random terms.)
- Differentiate between data and types.
- Manage the creation of resources/nodes with the appropriate type and data. (Maybe with models.)
- Be the entrypoint for every CRUD operation on resources in the store.
- Implement a transition from convenient resource nodes to/from quads for datasets and stores.
- Cache nodes, merge changes and organize access and TTLs.
- Have a consistent data model to prevent inconsistent behaviour. (Do not accept custom nodes.)
- Be able to update single data points as well as huge datasets. (Minimize redundant operations.)
- Notify resources and other listeners via events on data updates.
- Prevent memory leaks and RAM overload. (Also reduce RAM usage as much as possible.)
- Have documented and easy to understand code without unnecessary extras. (Also a ton of mocha tests.)

All in all, if we want to have a chance of getting the space right in whatever way we want or decide, we must definitely
describe our interface and the reasons for our decision in detail, before we start implementing anything. Otherwise, no
one will be able to rely on this module and maintain it in the future.

#### Questions to answer:

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
interface Space {

};

interface Node {

};

interface Literal {

};
```
