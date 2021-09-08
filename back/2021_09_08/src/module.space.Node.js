const
    _            = require('./module.space.util.js'),
    _persistence = require('@nrd/fua.module.persistence'),
    _space       = require('./module.space.js'),
    _states      = {
        idle:    0,
        loaded:  1,
        deleted: -1
    };

module.exports = class Node extends _.ProtectedEmitter {

    #properties = new Map();
    #state      = _states.idle;

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        // _.assert(space.factory.isTerm(term), 'Node#constructor : expected term to be a Term', TypeError);
        _.assert(space.factory.isSubject(term), 'Node#constructor : expected term to be a Subject-Term', TypeError);
        super();
        this.space = space;
        this.term  = term;
        _.lockAllProp(this);
    } // Node#constructor

    async load() {
        // TODO
    }

    async save() {
        // TODO
    }

    property(key) {
        _.assert(this.#state === _states.loaded, 'Node#property : expected node to be loaded');
        const predicate = this.space.getNode(key);
        let property    = this.#properties.get(predicate);
        if (!property) {
            property = new _space.Property(_.SECRET, this, predicate);
            this.#properties.set(predicate, property);
        }
        return property;
    }

}; // Node
