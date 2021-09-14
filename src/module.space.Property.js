const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Property extends _.ProtectedEmitter {

    #space     = null;
    // /** @type {_space.Node} */
    #subject   = null;
    // /** @type {_space.Node} */
    #predicate = null;
    /** @type {Set<_space.Node | _space.Literal>} */
    #objects   = new Set();

    constructor(secret, space, subject, predicate) {
        _.assert(secret === _.SECRET, 'Property#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Property#constructor : expected space to be a Space', TypeError);
        _.assert(subject instanceof _space.Node, 'Property#constructor : expected subject to be a Node', TypeError);
        _.assert(predicate instanceof _space.Node, 'Property#constructor : expected predicate to be a Node', TypeError);
        // TODO assert equal spaces
        // IDEA maybe make space etc. public to make comparison easier
        super();
        this.#space     = space;
        this.#subject   = subject;
        this.#predicate = predicate;
    } // Property#constructor

    value() {
        if (this.#objects.size !== 1) return null;
        return Array.from(this.#objects.values())[0];
    }

    values() {
        return Array.from(this.#objects.values());
    }

    add(object) {
        _.assert(_.isObject(object), 'Property#add : expected object to be an object');
        try {
            object = this.#space.node(object);
        } catch (err) {
            object = this.#space.literal(object);
        }
        const previousSize = this.#objects.size;
        this.#objects.add(object);
        const added = this.#objects.size > previousSize;
        return added;
    } // Property#add

    has(object) {
        _.assert(_.isObject(object), 'Property#add : expected object to be an object');
        try {
            object = this.#space.node(object);
        } catch (err) {
            object = this.#space.literal(object);
        }
        return this.#objects.has(object);
    } // Property#has

    delete(object) {
        _.assert(_.isObject(object), 'Property#add : expected object to be an object');
        try {
            object = this.#space.node(object);
        } catch (err) {
            object = this.#space.literal(object);
        }
        const deleted = this.#objects.delete(object);
        return deleted;
    } // Property#delete

    toJSON() {
        return Array.from(this.#objects,
            (object) => (object instanceof _space.Node)
                ? {'@id': object.id}
                : object.toJSON()
        );
    } // Property#toJSON

    // TODO

}; // Property
