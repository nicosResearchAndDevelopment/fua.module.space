const
    _                                 = require('./util.js'),
    loadSpace                         = require('./module.space.load.js'),
    {DataFactory, Dataset, DataStore} = require('@nrd/fua.module.persistence'),
    InmemoryStore                     = require('@nrd/fua.module.persistence.inmemory');

class SpaceNode {

    constructor(space, id) {
        this.space  = space;
        this['@id'] = id;
        _.lockProp(this, 'space', '@id');
    } // SpaceNode#constructor

    async load() {
        _.assert(!this['@type'], 'SpaceNode#load : already loaded');

        const
            factory  = this.space.factory,
            store    = this.space.store,
            subject  = this['@id'].startsWith('_:')
                ? factory.blankNode(this['@id'].substr(2))
                : factory.namedNode(this['@id']),
            /** @type {Dataset} */
            subjData = await store.match(subject),
            rdf_type = factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type').value;

        this['@type'] = [];
        _.lockProp(this, '@type');

        for (let {predicate, object} of subjData) {
            const
                key  = predicate.value,
                prop = this[key] || (this[key] = []);

            if (key === rdf_type) {
                this['@type'].push(object.value);
            } else {
                switch (object.termType) {
                    case 'NamedNode':
                        prop.push(new SpaceNode(this.space, object.value));
                        break;
                    case 'BlankNode':
                        prop.push(new SpaceNode(this.space, '_:' + object.value));
                        break;
                    case 'Literal':
                        prop.push(object.language
                            ? {'@value': object.value, '@language': object.language}
                            : {'@value': object.value, '@type': object.datatype});
                        break;
                } // switch
            }
        } // for

        return this;
    } // SpaceNode#load

} // SpaceNode

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
        _.lockProp(this, 'dataset', 'dataStore', 'factory');
    } // Space#constructor

    async load(param) {
        const resultArr = await loadSpace(param);
        for (let result of resultArr) {
            if (result.dataset)
                this.data.add(result.dataset);
        }
    } // Space#load

    async getNode(subjectIRI) {
        if (this.factory.isNamedNode(subjectIRI)) subjectIRI = subjectIRI.value;
        else if (this.factory.isBlankNode(subjectIRI)) subjectIRI = '_:' + subjectIRI.value;
        else _.assert(_.isString(subjectIRI), 'Space#getNode : invalid subjectIRI', TypeError);

        const subjNode = new SpaceNode(this, subjectIRI);
        await subjNode.load();

        return subjNode;
    } // Space#getNode

} // Space

module.exports = Space;