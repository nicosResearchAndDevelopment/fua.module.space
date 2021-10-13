const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Node extends _.ProtectedEmitter {

    #space;
    #factory;
    #term;
    #id;

    #loadedData;
    #currentData;
    #predicates;
    #loaded;

    constructor(secret, space, id) {
        _.assert(secret === _.SECRET, 'Node#constructor : protected method');
        super();
        this.#space   = space;
        this.#factory = space.getStore(_.SECRET).factory;
        this.#term    = id.startsWith('_:') ? this.#factory.blankNode(id.substr(2)) : this.#factory.namedNode(id);
        this.#id      = id;

        this.#loadedData  = null;
        this.#currentData = new _persistence.Dataset(null, this.#factory);
        this.#predicates  = new Set();
        this.#loaded      = false;
    } // Node#constructor

    getSpace(secret) {
        _.assert(secret === _.SECRET, 'Node#getSpace : protected method');
        return this.#space;
    } // Node#getSpace

    get id() {
        return this.#id;
    } // Node#id

    get term() {
        return this.#term;
    } // Node#term

    // DONE id: string

    /**
     * @param {string} prop
     * @returns {_space.Node | null}
     */
    getNode(prop) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#getNode : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        if (objects.length !== 1) return null;
        return _termToNode.call(this.#space, objects[0]);
    } // Node#getNode

    setNode(prop, value) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#setNode : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#setNode : can only set a node on a single value property');
        const node = this.#space.getNode(value);
        if (objects.length > 0) {
            const previousNode = _termToNode.call(this.#space, objects[0]);
            _.assert(previousNode, 'Node#setNode : can only set a node on a node property');
            if (node.term.equals(previousNode.term)) return;
            this.#currentData.deleteMatches(this.term, predicate, previousNode.term);
        }
        this.#currentData.add(this.#factory.quad(this.term, predicate, node.term));
    } // Node#setNode

    deleteNode(prop) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#setNode : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#deleteNode : can only delete a node on a single value property');
        if (objects.length > 0) {
            const previousNode = _termToNode.call(this.#space, objects[0]);
            _.assert(previousNode, 'Node#deleteNode : can only delete a node on a node property');
            this.#currentData.deleteMatches(this.term, predicate, previousNode.term);
        }
    } // Node#deleteNode

    // DONE getNode(predicate): Node | null
    // DONE setNode(predicate, object): void
    // DONE deleteNode(predicate): void

    /**
     * @param {string} prop
     * @returns {_space.Literal | null}
     */
    getLiteral(prop) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#getLiteral : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        if (objects.length !== 1) return null;
        return _termToLiteral.call(this.#space, objects[0]);
    } // Node#getLiteral

    setLiteral(prop, value, option) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#setLiteral : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#setLiteral : can only set a literal on a single value property');
        const literal = this.#space.getLiteral(value, option);
        if (objects.length > 0) {
            const previousLiteral = _termToLiteral.call(this.#space, objects[0]);
            _.assert(previousLiteral, 'Node#setLiteral : can only set a literal on a literal property');
            if (literal.term.equals(previousLiteral.term)) return;
            this.#currentData.deleteMatches(this.term, predicate, previousLiteral.term);
        }
        this.#currentData.add(this.#factory.quad(this.term, predicate, literal.term));
    } // Node#setLiteral

    deleteLiteral(prop) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#deleteLiteral : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#deleteLiteral : can only set a literal on a single value property');
        if (objects.length > 0) {
            const previousLiteral = _termToLiteral.call(this.#space, objects[0]);
            _.assert(previousLiteral, 'Node#deleteLiteral : can only set a literal on a literal property');
            this.#currentData.deleteMatches(this.term, predicate, previousLiteral.term);
        }
    } // Node#deleteLiteral

    // DONE getValue(predicate): Literal | null
    // DONE setValue(predicate, object, [langOrDt]): void
    // DONE deleteValue(predicate): void

    /**
     * @param {string} prop
     * @returns {Array<_space.Node>}
     */
    getNodes(prop) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#getNodes : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        return objects.map(_termToNode.bind(this.#space)).filter(node => node);
    } // Node#getNodes

    // DONE getNodes(predicate): Array<Node>
    // TODO setNodes(predicate, objects): void
    // TODO addNodes(predicate, objects): void
    // TODO deleteNodes(predicate, objects): void

    /**
     * @param {string} prop
     * @returns {Array<_space.Literal>}
     */
    getLiterals(prop) {
        const predicate = this.#factory.namedNode(prop);
        _.assert(this.#loaded || this.#predicates.has(predicate.value), 'Node#getLiterals : prop not loaded');
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        return objects.map(_termToLiteral.bind(this.#space)).filter(node => node);
    } // Node#getLiterals

    // DONE getValues(predicate): Array<Literal>
    // TODO setValues(predicate, objects): void
    // TODO addValues(predicate, objects): void
    // TODO deleteValues(predicate, objects): void

    // TODO load([predicates]): Promise<void>
    // TODO save([predicates]): Promise<void>

}; // Node

/**
 * @this {_space.Space}
 * @param {_persistence.Term} term
 * @returns {_space.Node | null}
 * @private
 */
function _termToNode(term) {
    if (term.termType === 'NamedNode') return this.getNode(term.value);
    if (term.termType === 'BlankNode') return this.getNode('_:' + term.value);
    return null;
} // _termToNode

/**
 * @this {_space.Space}
 * @param {_persistence.Term} term
 * @returns {_space.Literal | null}
 * @private
 */
function _termToLiteral(term) {
    if (term.termType === 'Literal') return this.getLiteral(term.value, term.language || term.datatype);
    return null;
} // _termToLiteral
