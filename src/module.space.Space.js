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
            _.assert(false, 'Space#node : expected id to be a string, a Term, a Node or an identifiable object', TypeError);
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
     * @param {string | _persistence.Term | _space.Node | {'@id': string}} [langOrDt]
     * @returns {_space.Literal}
     */
    literal(value, langOrDt) {
        let term, language = '', datatype = '', literal;

        if (_.isObject(value)) {
            _.assert(_.isNull(langOrDt), 'Space#literal : no langOrDt in object mode', TypeError);
            if (value instanceof _space.Literal) {
                term = value.term;
            } else if (this.factory.isLiteral(value)) {
                term = value;
            } else if ('@value' in value) {
                return this.literal(value['@value'], value['@language'] || value['@type'] && this.node(value['@type']));
            } else {
                _.assert(false, 'Space#literal : invalid value', TypeError);
            }
        } else if (_.isString(value)) {
            if (_.isString(langOrDt)) {
                language = langOrDt;
                datatype = _.iris.rdf_langString;
            } else if (langOrDt instanceof _space.Node) {
                datatype = langOrDt.id;
            } else if (this.factory.isTerm(langOrDt)) {
                datatype = langOrDt.value;
            } else if (_.isObject(langOrDt) && _.isString(langOrDt['@id'])) {
                datatype = langOrDt['@id'];
            } else if (_.isNull(langOrDt)) {
                datatype = _.iris.xsd_string;
            } else {
                _.assert(false, 'Space#literal : invalid langOrDt', TypeError);
            }
        } else if (_.isNumber(value)) {
            value = value.toString();
            if (_.isInteger(value)) {
                datatype = _.iris.xsd_integer;
            } else {
                datatype = _.iris.xsd_decimal;
            }
        } else if (_.isBoolean(value)) {
            value    = value.toString();
            datatype = _.iris.xsd_boolean;
        } else {
            _.assert(false, 'Space#literal : invalid value', TypeError);
        }

        term    = term || this.factory.literal(value, language || this.factory.namedNode(datatype));
        literal = new _space.Literal(_.SECRET, this, term);

        return literal;
    } // Space#literal

}; // Space
