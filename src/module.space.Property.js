const
    _            = require('./module.space.util.js'),
    _persistence = require('@nrd/fua.module.persistence'),
    _space       = require('./module.space.js');

module.exports = class Property extends _.ProtectedEmitter {

    #objects = new Set();

    constructor(secret, subject, predicate, objects = []) {
        _.assert(secret === _.SECRET, 'Property#constructor : private method is not accessible');
        _.assert(subject instanceof _space.Node, 'Property#constructor : expected subject to be a Node', TypeError);
        _.assert(predicate instanceof _space.Node, 'Property#constructor : expected predicate to be a Node', TypeError);
        super();
        this.subject   = subject;
        this.predicate = predicate;
        objects.forEach(obj => this.#objects.add(obj));
        _.lockAllProp(this);
    } // Property#constructor

}; // Property
