const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Relation extends _.ProtectedEmitter {

    /** @type {Set<_space.Node | _space.Literal>} */
    #objects = new Set();

    constructor(secret, subject, predicate) {
        _.assert(secret === _.SECRET, 'Relation#constructor : private method is not accessible');
        _.assert(subject instanceof _space.Node, 'Relation#constructor : expected subject to be a Node', TypeError);
        _.assert(predicate instanceof _space.Node, 'Relation#constructor : expected predicate to be a Node', TypeError);
        _.assert(subject.space === predicate.space, 'Relation#constructor : expected subject and predicate to be in the same space');
        super();
        this.space     = subject.space;
        this.subject   = subject;
        this.predicate = predicate;
        _.hideProp(this, 'space', 'subject', 'predicate');
        _.lockProp(this, 'space', 'subject', 'predicate');
    } // Relation#constructor

    value() {
        if (this.#objects.size !== 1) return null;
        return Array.from(this.#objects.values())[0];
    }

    values() {
        return Array.from(this.#objects.values());
    }

    add(object) {
        _.assert(_.isObject(object), 'Relation#add : expected object to be an object');
        object             = this.space.get(object);
        const previousSize = this.#objects.size;
        this.#objects.add(object);
        const added = this.#objects.size > previousSize;
        return added;
    } // Relation#add

    set(objects) {
        objects = _.toArray(objects).map((object) => this.space.get(object));
    } // Relation#set

    has(object) {
        _.assert(_.isObject(object), 'Relation#add : expected object to be an object');
        object = this.space.get(object);
        return this.#objects.has(object);
    } // Relation#has

    delete(object) {
        _.assert(_.isObject(object), 'Relation#add : expected object to be an object');
        object        = this.space.get(object);
        const deleted = this.#objects.delete(object);
        return deleted;
    } // Relation#delete

    toJSON() {
        return Array.from(this.#objects,
            (object) => (object instanceof _space.Node)
                ? {'@id': object.id}
                : object.toJSON()
        );
    } // Relation#toJSON

    // TODO

}; // Relation
