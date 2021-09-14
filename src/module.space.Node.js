const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Node extends _.ProtectedEmitter {

    #space      = null;
    #term       = null;
    /** @type {Map<string, Set<_space.Node | _space.Literal>>} */
    #properties = new Map();

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        _.assert(space.factory.isSubject(term), 'Node#constructor : expected term to be a Subject', TypeError);
        super();
        this.#space = space;
        this.#term  = term;
    } // Node#constructor

    get term() {
        return this.#term;
    }

    get id() {
        return this.#term.value;
    }

    toJSON() {
        // TODO
    } // Node#toJSON

    // TODO

}; // Node
