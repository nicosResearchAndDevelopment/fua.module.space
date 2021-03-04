const
    _                                 = require('./module.space.util.js'),
    loadLocalData                     = require('./module.space.load.js'),
    Resource                          = require('./module.space.Resource.js'),
    {DataFactory, Dataset, DataStore} = require('@nrd/fua.module.persistence'),
    InmemoryStore                     = require('@nrd/fua.module.persistence.inmemory');

class Space {

    #nodes = new Map();

    constructor(options) {
        _.assert(_.isObject(options), 'Space#constructor : invalid options', TypeError);
        if (_.isDefined(options.dataset)) _.assert(options.dataset instanceof Dataset,
            'Space#constructor : invalid options.dataset', TypeError);
        if (_.isDefined(options.dataStore)) _.assert(options.dataStore instanceof DataStore,
            'Space#constructor : invalid options.dataStore', TypeError);
        if (_.isDefined(options.factory)) _.assert(options.factory instanceof DataFactory,
            'Space#constructor : invalid options.factory', TypeError);
        if (_.isDefined(options.context)) _.assert(_.isObject(options.context),
            'Space#constructor : invalid options.context', TypeError);

        const
            factory   = options.factory || (options.dataset ? options.dataset.factory : options.dataStore ? options.dataStore.factory : new DataFactory(options.context)),
            dataset   = options.dataset || new Dataset(null, factory),
            dataStore = options.dataStore || new InmemoryStore(null, factory);

        _.assert(factory === dataset.factory && factory === dataStore.factory,
            'Space#constructor : different factories are not allowed');

        this.localData = dataset;
        this.dataStore = dataStore;
        this.factory   = factory;

        _.lockProp(this, 'data', 'store', 'factory');
    } // Space#constructor

    async load(param) {
        const resultArr = await loadLocalData.call(this.factory, param);
        for (let result of resultArr) {
            if (result.dataset)
                this.localData.add(result.dataset);
        }
    } // Space#load

    /**
     * @param {string | {"@id": string}} id
     * @returns {Resource}
     */
    getNode(id) {
        if (_.isObject(id)) id = id['@id'];
        _.assert(_.isString(id), 'Space#getNode : invalid id', TypeError);

        // this round-trip is useful to transform the id with the context of the factory and validate patterns
        id = id.startsWith('_:')
            ? '_:' + this.factory.blankNode(id.substr(2)).value
            : this.factory.namedNode(id).value;

        let node = this.#nodes.get(id);
        if (!node) {
            node = new Resource(this, id);
            this.#nodes.set(id, node);
        }

        return node;
    } // Space#getNode

} // Space

module.exports = Space;