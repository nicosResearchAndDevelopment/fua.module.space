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
        this.#store = param.store;
    } // Space#constructor

    get factory() {
        return this.#store.factory;
    }

    /**
     * @param {string | _persistence.Term | _space.Node | {'@id': string}} id
     * @returns {_space.Node}
     */
    node(id) {
        let term, node;

        if (_.isObject(id)) {
            if (id instanceof _space.Node) {
                if (id._space(_.SECRET) === this) node = id;
                else term = id._term(_.SECRET);
            } else if (this.factory.isTerm(id)) {
                term = id;
            } else if ('@id' in id) {
                return this.node(id['@id']);
                // } else if ('@value' in id) {
                //     return this.literal(id);
            } else {
                _.assert(false, 'Space#node : invalid id', TypeError);
            }
        } else if (_.isString(id)) {
            term = this.factory.termFromId(id);
        } else {
            _.assert(false, 'Space#node : invalid id', TypeError);
        }

        if (!node) {
            let node_id = this.factory.termToId(term);
            let ref     = this.#nodes.get(node_id);
            node        = ref.deref();

            if (!node) {
                node = new _space.Node(_.SECRET, this, term);
                ref  = new WeakRef(node);
                this.#nodes.set(node_id, ref);
                this._emit(_.SECRET, _.events.node_created, node);
            }
        }

        return node;
    } // Space#node

    /**
     * @param {string | number | boolean | _persistence.Literal | _space.Literal | {'@value': string | number | boolean, '@language'?: string, '@type'?: string | _persistence.Term | _space.Node | {'@id': string}}} value
     * @param {string | _persistence.Term | _space.Node | {'@id': string}} [langOrDt]
     * @returns {_space.Literal}
     */
    literal(value, langOrDt) {
        let language = '', datatype, term, literal;

        if (_.isObject(value)) {
            _.assert(_.isNull(langOrDt), 'Space#literal : no langOrDt in object mode', TypeError);
            if (value instanceof _space.Literal) {
                if (value._space(_.SECRET) === this) literal = value;
                else term = value._term(_.SECRET);
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
                datatype = this.factory.namedNode(_.iris.rdf_langString);
            } else if (langOrDt instanceof _space.Node) {
                datatype = langOrDt._term(_.SECRET);
            } else if (this.factory.isTerm(langOrDt)) {
                datatype = langOrDt;
            } else if (_.isObject(langOrDt) && _.isString(langOrDt['@id'])) {
                datatype = this.factory.namedNode(langOrDt['@id']);
            } else if (_.isNull(langOrDt)) {
                datatype = this.factory.namedNode(_.iris.xsd_string);
            } else {
                _.assert(false, 'Space#literal : invalid langOrDt', TypeError);
            }
        } else if (_.isNumber(value)) {
            value = value.toString();
            if (_.isInteger(value)) {
                datatype = this.factory.namedNode(_.iris.xsd_integer);
            } else {
                datatype = this.factory.namedNode(_.iris.xsd_decimal);
            }
        } else if (_.isBoolean(value)) {
            value    = value.toString();
            datatype = this.factory.namedNode(_.iris.xsd_boolean);
        } else {
            _.assert(false, 'Space#literal : invalid value', TypeError);
        }

        if (!literal) {
            term        = term || this.factory.literal(value, language || datatype);
            let node_id = this.factory.termToId(term);
            let ref     = this.#nodes.get(node_id);
            literal     = ref.deref();

            if (!literal) {
                literal = new _space.Literal(_.SECRET, this, term);
                ref     = new WeakRef(literal);
                this.#nodes.set(node_id, ref);
                this._emit(_.SECRET, _.events.literal_created, literal);
            }
        }

        return literal;
    } // Space#literal

}; // Space
