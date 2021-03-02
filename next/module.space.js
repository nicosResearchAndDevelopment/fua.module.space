const
    _             = require('./util.js'),
    {
        TermFactory, DataFactory, Dataset, DataStore
    }             = require('@nrd/fua.module.persistence'),
    InmemoryStore = require('@nrd/fua.module.persistence.inmemory'),
    loadSpace     = require('./module.space.load.js');

class Space {

    /** @type {Dataset} */
    #dataset   = null;
    /** @type {DataStore} */
    #dataStore = null;

    constructor(options) {
        _.assert(_.isObject(options), 'Space#constructor : invalid options', TypeError);
        _.assert(!_.isDefined(options.dataset) || (options.dataset instanceof Dataset),
            'Space#constructor : invalid options.dataset', TypeError);
        _.assert(!_.isDefined(options.dataStore) || (options.dataStore instanceof DataStore),
            'Space#constructor : invalid options.dataStore', TypeError);
        _.assert(!_.isDefined(options.context) || _.isObject(options.context),
            'Space#constructor : invalid options.context', TypeError);

        this.termFactory = new TermFactory(options.context);
        this.dataFactory = new DataFactory(options.context);
        _.lockProp(this, 'termFactory', 'dataFactory');

        this.#dataset   = options.dataset || new Dataset(null, this.dataFactory);
        this.#dataStore = options.dataStore || new InmemoryStore(null, this.dataFactory);
    } // Space#constructor

    async load(param) {
        const resultArr = await loadSpace(param);
        for (let result of resultArr) {
            if (result.dataset)
                this.#dataset.add(result.dataset);
        }
    } // Space#load

    async getNode(subjectIRI) {
        _.assert(_.isString(subjectIRI), 'Space#getNode : invalid subjectIRI', TypeError);

        const
            subject  = subjectIRI.startsWith('_:')
                ? this.dataFactory.blankNode(subjectIRI.substr(2))
                : this.dataFactory.namedNode(subjectIRI),
            /** @type {Dataset} */
            subjData = await this.#dataStore.match(subject);

        if (subjData.size === 0) return null;
        const subjNode = {'@id': subject.value};

        for (let {predicate, object} of subjData) {
            const
                key  = predicate.value,
                prop = subjNode[key] || (subjNode[key] = []);
            switch (object.termType) {
                case 'NamedNode':
                    prop.push({'@id': object.value});
                    break;
                case 'BlankNode':
                    prop.push({'@id': '_:' + object.value});
                    break;
                case 'Literal':
                    prop.push(object.language
                        ? {'@value': object.value, '@language': object.language}
                        : {'@value': object.value, '@type': object.datatype});
                    break;
            }
        }

        const rdf_type = this.dataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type').value;
        if (subjNode[rdf_type]) {
            subjNode['@type'] = subjNode[rdf_type].map(node => node['@id']);
            delete subjNode[rdf_type];
        }
        return subjNode;
    } // Space#getNode

} // Space

module.exports = Space;