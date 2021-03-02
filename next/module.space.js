const
    _                                 = require('./module.space.util.js'),
    loadSpace                         = require('./module.space.load.js'),
    {DataFactory, Dataset, DataStore} = require('@nrd/fua.module.persistence'),
    InmemoryStore                     = require('@nrd/fua.module.persistence.inmemory'),
    {Literal, Resource, Model}        = require('./module.space.NodeClasses.js');

class Space {

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
            'Space#cosntructor : different factories are not allowed');

        this.data    = dataset;
        this.store   = dataStore;
        this.factory = factory;
        this._nodes  = new Map();
        _.lockProp(this, 'data', 'store', 'factory', '_nodes');
    } // Space#constructor

    async load(param) {
        const resultArr = await loadSpace(param);
        for (let result of resultArr) {
            if (result.dataset)
                this.data.add(result.dataset);
        }
    } // Space#load

    getNode(id) {
        if (this.factory.isNamedNode(id)) id = id.value;
        else if (this.factory.isBlankNode(id)) id = '_:' + id.value;
        else _.assert(_.isString(id), 'Space#getNode : invalid id', TypeError);

        let node = this._nodes.get(id);
        if (!node) {
            node = new Resource(this, id);
            this._nodes.set(id, node);
        }
        return node;
    } // Space#getNode

    setModel(id, builder) {
        if (this.factory.isNamedNode(id)) id = id.value;
        else if (this.factory.isBlankNode(id)) id = '_:' + id.value;
        else _.assert(_.isString(id), 'Space#setModel : invalid id', TypeError);
        _.assert(_.isFunction(builder), 'Space#setModel : invalid builder', TypeError);
        _.assert(!this._nodes.has(id), 'Space#setModel : id already in use');

        let node = new Model(this, id, builder);
        this._nodes.set(id, node);
        return node;
    } // Space#setModel

} // Space

module.exports = Space;