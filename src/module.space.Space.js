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

    getNodeId(node) {
        if (_.isString(node)) {
            if (this.#nodes.has(node)) return node;
            if (node.startsWith('_:')) return '_:' + this.#factory.blankNode(node.substr(2)).value;
            return this.#factory.namedNode(node).value;
        }
        if (node instanceof _space.Node) {
            if (node.getSpace(_.SECRET) === this) return node.id;
            return this.getNodeId(node.id);
        }
        if (this.#factory.isTerm(node)) {
            if (node.termType === 'NamedNode') return this.getNodeId(node.value);
            if (node.termType === 'BlankNode') return this.getNodeId('_:' + node.value);
            _.assert(false, 'Space#getNodeId : terms must be NamedNode or BlankNode');
        }
        if (_.isObject(node)) {
            if (_.isString(node['@id'])) return this.getNodeId(node['@id']);
            _.assert(false, 'Space#getNodeId : objects must have an @id');
        }
        _.assert(false, 'Space#getNodeId : node type is not supported');
    } // Space#getNodeId

    getNode(id) {
        id       = this.getNodeId(id);
        let node = this.#nodes.get(id);
        if (node) return node;
        node = new _space.Node(_.SECRET, this, id);
        this.#nodes.set(id, node);
        return node;
    } // Space#getNode

    getLiteral(value, option) {
        _.assert(false, 'Space#getLiteral : TODO');
    } // Space#getLiteral

}; // Space
