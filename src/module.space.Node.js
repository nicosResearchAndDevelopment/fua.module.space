const
    _            = require('./module.space.util.js'),
    _persistence = require('@nrd/fua.module.persistence'),
    _space       = require('./module.space.js');

module.exports = class Node extends _.ProtectedEmitter {

    #properties = new Map();

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        _.assert(space.factory.isTerm(term), 'Node#constructor : expected term to be a Term', TypeError);
        super();
        this.space = space;
        this.term  = term;
        this.id    = term.value;
        _.lockAllProp(this);
    } // Node#constructor

}; // Node
