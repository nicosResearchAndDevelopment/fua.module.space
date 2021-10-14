const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Space extends _.ProtectedEmitter {

    /** @type {import('@nrd/fua.module.persistence').DataStore} */
    #store   = null;
    /** @type {import('@nrd/fua.module.persistence').DataFactory} */
    #factory = null;
    /** @type {Map<string, import('./module.space.js').Node>} */
    #nodes   = new Map();

    /**
     * @param {Object} param
     * @param {_persistence.DataStore} param.store
     */
    constructor(param) {
        _.assert(_.isObject(param), 'Space#constructor : expected param to be an object', TypeError);
        _.assert(param.store instanceof _persistence.DataStore, 'Space#constructor : expected param.store to be a DataStore', TypeError);
        super();
        /** @type {_persistence.DataStore} */
        this.#store = param.store;
        /** @type {_persistence.TermFactory} */
        this.#factory = param.store.factory;
    } // Space#constructor

    getStore(secret) {
        _.assert(secret === _.SECRET, 'Space#getStore : protected method');
        return this.#store;
    } // Space#getStore

    getNodeTerm(node) {
        if (_.isString(node)) {
            if (this.#nodes.has(node)) return this.#nodes.get(node).term;
            if (node.startsWith('_:')) this.#factory.blankNode(node.substr(2));
            return this.#factory.namedNode(node);
        }
        if (node instanceof _space.Node) {
            if (node.getSpace(_.SECRET) === this) return node.term;
            return this.getNodeTerm(node.term);
        }
        if (this.#factory.isTerm(node)) {
            if (node.termType === 'NamedNode') return this.getNodeTerm(node.value);
            if (node.termType === 'BlankNode') return this.getNodeTerm('_:' + node.value);
            _.assert(false, 'Space#getNodeTerm : terms must be NamedNode or BlankNode');
        }
        if (_.isObject(node)) {
            if (_.isString(node['@id'])) return this.getNodeTerm(node['@id']);
            _.assert(false, 'Space#getNodeTerm : objects must have an @id');
        }
        _.assert(false, 'Space#getNodeTerm : node type is not supported');
    } // Space#getNodeTerm

    getNode(id) {
        const term = this.getNodeTerm(id);
        id         = this.#factory.termToId(term);
        let node   = this.#nodes.get(id);
        if (node) return node;
        node = new _space.Node(_.SECRET, this, term);
        this.#nodes.set(id, node);
        return node;
    } // Space#getNode

    getLiteralTerm(value, option) {
        if (_.isString(value)) {
            if (!option) return this.#factory.literal(value);
            if (_.isString(option)) return this.#factory.literal(value, option);
            return this.#factory.literal(value, this.getNodeTerm(option));
        }
        if (value instanceof _space.Literal) {
            if (value.getSpace(_.SECRET) === this) return value.term;
            return this.getLiteralTerm(value.term);
        }
        if (this.#factory.isTerm(value)) {
            if (value.termType === 'Literal') return this.getLiteralTerm(value.value, value.language || this.getNodeTerm(value.datatype));
            _.assert(false, 'Space#getLiteralTerm : terms must be Literal');
        }
        if (_.isObject(value)) {
            if (_.isString(value['@value'])) {
                if (_.isString(value['@language'])) return this.getLiteralTerm(value['@value'], value['@language']);
                if (_.isString(value['@type'])) return this.getLiteralTerm(value['@value'], {'@id': this.getNode(value['@type'])});
                return this.getLiteralTerm(value['@value']);
            }
            _.assert(false, 'Space#getLiteralTerm : objects must have an @value');
        }
        _.assert(false, 'Space#getLiteralTerm : literal type is not supported');
    } // Space#getLiteralTerm

    getLiteral(value, option) {
        const term = this.getLiteralTerm(value, option);
        return _space.Literal(_.SECRET, this, term);
    } // Space#getLiteral

}; // Space
