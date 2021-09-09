const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Space extends _.ProtectedEmitter {

    #store = null;
    #nodes = new Map();

    /**
     * @param {Object} param
     * @param {_persistence.DataStore} param.store
     */
    constructor(param) {
        _.assert(_.isObject(param), 'Space#constructor : expected param to be an object', TypeError);
        _.assert(param.store instanceof _persistence.DataStore, 'Space#constructor : expected param.store to be a DataStore', TypeError);
        super();
        this.#store  = param.store;
        this.factory = this.#store.factory;
        _.lockAllProp(this);
    } // Space#constructor

    /**
     * @param {string | _persistence.Term | _space.Node | {'@id': string}} id
     * @returns {_space.Node}
     */
    node(id) {
        let term, ref, node;

        if (_.isString(id)) {
            // if (id.startsWith('_:')) term = this.factory.blankNode(id.substr(2));
            // else term = this.factory.namedNode(id);
            term = this.factory.termFromId(id);
            id   = term.value;
        } else if (id instanceof _space.Node) {
            return this.getNode(id.id);
        } else if (this.factory.isTerm(id)) {
            term = id;
            id   = term.value;
        } else if (_.isObject(id) && _.isString(id['@id'])) {
            return this.getNode(id['@id']);
        } else {
            _.assert(false, 'Space#getNode : expected id to be a string, a Term, a Node or an identifiable object', TypeError);
        }

        ref  = this.#nodes.get(id);
        node = ref.deref();

        if (!node) {
            node = new _space.Node(_.SECRET, this, term);
            ref  = new WeakRef(node);
            this.#nodes.set(id, ref);
            this._emit(_.SECRET, _.events.node_created, node);
        }

        return node;
    } // Space#node

    /**
     * @param {string | number | boolean | _persistence.Literal | _space.Literal | {'@value': string | number | boolean, '@language'?: string, '@type'?: string | _persistence.Term | _space.Node | {'@id': string}}} value
     * @param {string | _persistence.Term | _space.Node | {'@id': string}} [langOrType]
     * @returns {_space.Literal}
     */
    literal(value, langOrType) {
        let term, language, datatype, literal;

        // TODO

        return literal;
    } // Space#literal

}; // Space
