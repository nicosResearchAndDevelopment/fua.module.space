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
    } // Relation#value

    values() {
        return Array.from(this.#objects.values());
    } // Relation#values

    clear() {
        this.#objects.clear();
    } // Relation#clear

    add(value, option) {
        const object       = this.space.get(value, option);
        const previousSize = this.#objects.size;
        this.#objects.add(object);
        const added = this.#objects.size > previousSize;
        // TODO check updates
        return added;
    } // Relation#add

    set(values, option) {
        const objects     = _.toArray(values).map((value) => this.space.get(value, option));
        const previousSet = this.#objects;
        this.#objects     = new Set(objects);
        // TODO check updates
        previousSet.clear();
        return true;
    } // Relation#set

    has(value, option) {
        const object = this.space.get(value, option);
        return this.#objects.has(object);
    } // Relation#has

    remove(value, option) {
        const object  = this.space.get(value, option);
        const deleted = this.#objects.delete(object);
        // TODO check updates
        return deleted;
    } // Relation#remove

    toJSON() {
        return Array.from(this.#objects,
            (object) => (object instanceof _space.Node)
                ? {'@id': object.id}
                : object.toJSON()
        );
    } // Relation#toJSON

    // TODO

}; // Relation
