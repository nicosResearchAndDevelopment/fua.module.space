const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Space extends _.ProtectedEmitter {

    /** @type {_persistence.DataStore} */
    #store = null;
    /** @type {Map<string, _space.Node | _space.Literal>} */
    #nodes = new Map();

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
        this.factory = param.store.factory;
        _.hideProp(this, 'factory');
        _.lockProp(this, 'factory');
    } // Space#constructor

    /**
     * @param {string | number | boolean | _space.Node | Term | _space.Literal | {'@id': string} | {'@value': string, '@language'?: string, '@type'?: string}} value
     * @param {string | Term | _space.Node | {'@id': string} | Function} option
     * @returns {_space.Node | _space.Literal}
     */
    get(value, option) {
        let term, node;

        if (_.isString(value)) {
            if (_.isNull(option)) {
                try {
                    if (value.startsWith('_:')) {
                        term = this.factory.blankNode(value.substr(2));
                    } else {
                        term = this.factory.namedNode(value);
                    }
                } catch (err) {
                    term = this.factory.literal(value);
                }
            } else if (_.isString(option)) {
                term = this.factory.literal(value, option);
            } else if (_.isObject(option)) {
                if (option instanceof _space.Node) {
                    term = this.factory.literal(value, option.term);
                } else if ('termType' in option) {
                    term = this.factory.literal(value, this.factory.fromTerm(option));
                } else if ('@id' in option) {
                    term = this.factory.literal(value, this.factory.namedNode(option['@id']));
                } else {
                    // TODO
                }
            } else if (_.isFunction(option)) {
                if (option === _space.Node) {
                    if (value.startsWith('_:')) {
                        term = this.factory.blankNode(value.substr(2));
                    } else {
                        term = this.factory.namedNode(value);
                    }
                } else if (option === _space.Literal) {
                    term = this.factory.literal(value);
                } else {
                    // TODO
                }
            } else {
                // TODO
            }
        } else if (_.isArray(value)) {
            // TODO
        } else if (_.isObject(value)) {
            if ((value instanceof _space.Node) || (value instanceof _space.Literal)) {
                if (value.space === this) node = value;
                else term = value.term;
            } else if ('termType' in value) {
                term = this.factory.fromTerm(value);
            } else if ('@id' in value) {
                if (value['@id'].startsWith('_:')) {
                    term = this.factory.blankNode(value['@id'].substr(2));
                } else {
                    term = this.factory.namedNode(value['@id']);
                }
            } else if ('@value' in value) {
                if ('@language' in value) {
                    term = this.factory.literal(value['@value'], value['@language']);
                } else if ('@type' in value) {
                    term = this.factory.literal(value['@value'], this.factory.namedNode(value['@type']));
                } else if (_.isString(value['@value'])) {
                    term = this.factory.literal(value['@value'], this.factory.namedNode(_.iris.xsd_string));
                } else if (_.isNumber(value['@value'])) {
                    if (_.isInteger(value['@value'])) {
                        term = this.factory.literal(value['@value'].toString(), this.factory.namedNode(_.iris.xsd_integer));
                    } else {
                        term = this.factory.literal(value['@value'].toString(), this.factory.namedNode(_.iris.xsd_decimal));
                    }
                } else if (_.isBoolean(value['@value'])) {
                    term = this.factory.literal(value['@value'].toString(), this.factory.namedNode(_.iris.xsd_boolean));
                } else {
                    // TODO
                }
            } else if ('@list' in value) {
                // TODO
            } else {
                // TODO
            }
        } else if (_.isNumber(value)) {
            if (_.isInteger(value)) {
                term = this.factory.literal(value.toString(), this.factory.namedNode(_.iris.xsd_integer));
            } else {
                term = this.factory.literal(value.toString(), this.factory.namedNode(_.iris.xsd_decimal));
            }
        } else if (_.isBoolean(value)) {
            term = this.factory.literal(value.toString(), this.factory.namedNode(_.iris.xsd_boolean));
        } else {
            // TODO
        }

        if (!node) {
            _.assert(term, 'Space#get : term could not be resolved');

            const id = this.factory.termToId(term);
            let ref  = this.#nodes.get(id);
            if (ref) node = ref.deref();

            if (!node) {
                node = this.factory.isLiteral(term)
                    ? new _space.Literal(_.SECRET, this, term)
                    : new _space.Node(_.SECRET, this, term);
                ref  = new WeakRef(node);
                this.#nodes.set(id, ref);
                this._emit(_.SECRET, _.events.node_created, node);
            }
        }

        return node;
    } // Space#get

}; // Space
