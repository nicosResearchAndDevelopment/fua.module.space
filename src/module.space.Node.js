const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Node extends _.ProtectedEmitter {

    /** @type {Map<_space.Node, Set<_space.Node | _space.Literal>>} */
    #relations = new Map();

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        _.assert(space.factory.isTerm(term), 'Node#constructor : expected term to be a Term', TypeError);
        super();
        this.space = space;
        this.term  = term;
        this.id    = space.factory.termToId(term);
        _.hideProp(this, 'space', 'term');
        _.lockProp(this, 'space', 'term', 'id');
    } // Node#constructor

    get(predicate) {
        predicate = this.space.get(predicate);
        _.assert(predicate instanceof Node && this.space.factory.isNamedNode(predicate.term),
            'Node#get : expected predicate to be a NamedNode');
        let relation = this.#relations.get(predicate);
        if (!relation) {
            relation = new _space.Relation(_.SECRET, this, predicate);
            this.#relations.set(predicate, relation);
        }
        return relation;
    }

    toJSON() {
        // TODO
    } // Node#toJSON

    // TODO

}; // Node
