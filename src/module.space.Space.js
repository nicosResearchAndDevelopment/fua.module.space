const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

/**
 * @class {_space.Space}
 */
module.exports = class Space extends _.ProtectedEmitter {

    // IDEA weak references to nodes
    // IDEA use store emitter to update nodes

    #store   = null;
    #factory = null;
    #nodes   = new Map();

    /**
     * @param {Object} param
     * @param {_persistence.DataStore} param.store
     */
    constructor(param) {
        _.assert(_.isObject(param), 'Space#constructor : expected param to be an object', TypeError);
        _.assert(param.store instanceof _persistence.DataStore, 'Space#constructor : expected param.store to be a DataStore', TypeError);
        super();
        this.#store   = param.store;
        this.#factory = this.#store.factory;
    } // Space#constructor

    /**
     * @param {Symbol} secret
     * @returns {_persistence.DataStore}
     * @protected
     */
    getStore(secret) {
        _.assert(secret === _.SECRET, 'Space#getStore : protected method');
        return this.#store;
    } // Space#getStore

    /**
     * @param {Symbol} secret
     * @returns {_persistence.DataFactory}
     * @protected
     */
    getFactory(secret) {
        _.assert(secret === _.SECRET, 'Space#getFactory : protected method');
        return this.#factory;
    } // Space#getFactory

    /**
     * @param {string | _space.Node} node
     * @returns {_persistence.NamedNode | _persistence.BlankNode}
     */
    getNodeTerm(node) {
        if (_.isString(node)) {
            if (node === '@type') node = _.iris.rdf_type;
            if (this.#nodes.has(node)) return this.#nodes.get(node).term;
            if (node.startsWith('_:')) return this.#factory.blankNode(node.substr(2));
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

    /**
     * @param {string | _space.Node} id
     * @returns {_space.Node}
     */
    getNode(id) {
        const term = this.getNodeTerm(id);
        id         = this.#factory.termToId(term);
        let node   = this.#nodes.get(id);
        if (node) return node;
        node = new _space.Node(_.SECRET, this, term);
        this.#nodes.set(id, node);
        return node;
    } // Space#getNode

    /**
     * @param {string | _space.Literal} value
     * @param {string | _space.Node} option
     * @returns {_persistence.Literal}
     */
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
                if (_.isString(value['@type'])) return this.getLiteralTerm(value['@value'], {'@id': value['@type']});
                return this.getLiteralTerm(value['@value']);
            }
            _.assert(false, 'Space#getLiteralTerm : objects must have an @value');
        }
        if (_.isBoolean(value)) {
            return this.getLiteralTerm(value.toString(), this.#factory.getNodeTerm(_.iris.xsd_boolean));
        }
        if (_.isNumber(value)) {
            if (_.isInteger(value)) return this.getLiteralTerm(value.toString(), this.#factory.getNodeTerm(_.iris.xsd_integer));
            return this.getLiteralTerm(value.toString(), this.#factory.getNodeTerm(_.iris.xsd_decimal));
        }
        _.assert(false, 'Space#getLiteralTerm : literal type is not supported');
    } // Space#getLiteralTerm

    /**
     * @param {string | _space.Literal} value
     * @param {string | _space.Node} option
     * @returns {_space.Literal}
     */
    getLiteral(value, option) {
        const term = this.getLiteralTerm(value, option);
        return new _space.Literal(_.SECRET, this, term);
    } // Space#getLiteral

    /**
     * @param {string | _space.Node} prop
     * @param {string | _space.Node} [subj]
     * @returns {Promise<_space.Node | _space.Literal>}
     */
    async findObjects(prop, subj) {
        let predicate, subject;
        predicate = this.getNodeTerm(prop);
        _.assert(predicate.termType === 'NamedNode', 'Space#findObjects : predicate must be a named node');
        if (subj) subject = this.getNodeTerm(subj);
        const
            data        = await this.#store.match(subject, predicate, undefined),
            objectNodes = Array.from(data.objects()).map((object) => {
                const isLiteral = object.termType === 'Literal';
                return isLiteral ? this.getLiteral(object) : this.getNode(object);
            });
        return objectNodes;
    } // Space#findObjects

    /**
     * @param {string | _space.Node} prop
     * @param {string | _space.Node | _space.Literal} [obj]
     * @returns {Promise<_space.Node>}
     */
    async findSubjects(prop, obj) {
        let predicate, object;
        predicate = this.getNodeTerm(prop);
        _.assert(predicate.termType === 'NamedNode', 'Space#findSubjects : predicate must be a named node');
        if (obj) {
            const isLiteral = (obj instanceof _space.Literal) || this.#factory.isLiteral(obj) || (_.isObject(obj) && ('@value' in obj));
            object          = isLiteral ? this.getLiteralTerm(obj) : this.getNodeTerm(obj);
        }
        const
            data         = await this.#store.match(undefined, predicate, object),
            subjectNodes = Array.from(data.subjects()).map(subject => this.getNode(subject));
        return subjectNodes;
    } // Space#findSubjects

}; // Space
