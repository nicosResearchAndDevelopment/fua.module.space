const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Node extends _.ProtectedEmitter {

    #space      = null;
    #term       = null;
    /** @type {Map<_space.Node, Set<_space.Node | _space.Literal>>} */
    #relations = new Map();
    /** @type {Map<_space.Node, Set<_space.Node | _space.Literal>>} */
    #added      = new Map();
    /** @type {Map<_space.Node, Set<_space.Node | _space.Literal>>} */
    #removed    = new Map();

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        _.assert(space.factory.isNamedNode(term) || space.factory.isBlankNode(term), 'Node#constructor : expected term to be a NamedNode or BlankNode', TypeError);
        super();
        this.#space = space;
        this.#term  = term;
    } // Node#constructor

    _space(secret) {
        _.assert(secret === _.SECRET, 'Node#_space : private method is not accessible');
        return this.#space;
    } // Node#_space

    _term(secret) {
        _.assert(secret === _.SECRET, 'Node#_term : private method is not accessible');
        return this.#term;
    } // Node#_term

    get term() {
        return this.#term;
    }

    get id() {
        switch (this.#term.termType) {
            case 'BlankNode':
                return '_:' + this.#term.value;
            case 'NamedNode':
                return this.#term.value;
        }
    }

    get(predicate) {
        predicate    = this.#space.node(predicate);
        let relation = this.#relations.get(predicate);
        if (!relation) {
            relation = new _space.Relation(_.SECRET, this.#space, this, predicate);
            this.#relations.set(predicate, relation);
        }
        return relation;
    }

    toJSON() {
        // TODO
    } // Node#toJSON

    // TODO

}; // Node
