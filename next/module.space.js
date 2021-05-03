const
    _                                 = require('./module.space.util.js'),
    {loadDataFiles}                   = require('@nrd/fua.module.rdf'),
    Resource                          = require('./module.space.Resource.js'),
    {DataFactory, Dataset, DataStore} = require('@nrd/fua.module.persistence'),
    InmemoryStore                     = require('@nrd/fua.module.persistence.inmemory');

/**
 * @typedef {Resource} SpaceResource
 */

class Space {

    #nodes = new Map();

    constructor(options = {}) {
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
        const resultArr = await loadDataFiles(param, this.factory);
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

    async readData(subject, predicate, object, graph) {
        _.assert(subject || object, 'Space#queryData : subject or object must be present');

        if (_.isDefined(subject) && !this.factory.isTerm(subject)) {
            subject = _.isObject(subject) ? subject['@id'] : subject;
            _.assert(_.isString(subject), 'Space#queryData : invalid subject', TypeError);
            subject = this.factory.termFromId(subject);
        }
        if (_.isDefined(predicate) && !this.factory.isTerm(predicate)) {
            predicate = _.isObject(predicate) ? predicate['@id'] : predicate;
            _.assert(_.isString(predicate), 'Space#queryData : invalid predicate', TypeError);
            predicate = this.factory.termFromId(predicate);
        }
        if (_.isDefined(object) && !this.factory.isTerm(object)) {
            object = _.isObject(object) ? object['@id'] : object;
            _.assert(_.isString(object), 'Space#queryData : invalid object', TypeError);
            object = this.factory.termFromId(object);
        }
        if (_.isDefined(graph) && !this.factory.isTerm(graph)) {
            graph = _.isObject(graph) ? graph['@id'] : graph;
            _.assert(_.isString(graph), 'Space#queryData : invalid graph', TypeError);
            graph = this.factory.termFromId(graph);
        }

        const
            localResults = this.localData.match(subject, predicate, object, graph),
            /** @type {Dataset} */
            dataResults  = await this.dataStore.match(subject, predicate, object, graph);

        dataResults.add(localResults);
        return dataResults;
    } // Space#readData

} // Space

module.exports = Space;