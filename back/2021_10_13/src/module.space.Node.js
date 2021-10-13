const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Node extends _.ProtectedEmitter {

    /** @type {Map<_space.Node, _space.Relation>} */
    #relations = new Map();

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        _.assert(space.factory.isNamedNode(term) || space.factory.isBlankNode(term),
            'Node#constructor : expected term to be a Term', TypeError);
        super();
        this.space = space;
        this.term  = term;
        this.id    = (space.factory.isBlankNode(term) ? '_:' : '') + term.value;
        _.hideProp(this, 'space', 'term');
        _.lockProp(this, 'space', 'term', 'id');
    } // Node#constructor

    clear() {
        for (let relation of this.#relations.values()) {
            relation.clear();
        }
        this.#relations.clear();
    } // Node#clear

    /**
     * @param predicate
     * @returns {_space.Relation}
     */
    get(predicate) {
        predicate    = this.space.get(predicate);
        let relation = this.#relations.get(predicate);
        if (!relation) {
            _.assert(predicate instanceof Node && this.space.factory.isNamedNode(predicate.term),
                'Node#get : expected predicate to be a NamedNode');
            relation = new _space.Relation(_.SECRET, this, predicate);
            this.#relations.set(predicate, relation);
        }
        return relation;
    } // Node#get

    set(predicate, values, option) {
        const relation = this.get(predicate);
        return relation.set(values, option);
    } // Node#set

    toJSON() {
        const
            rdf_type = this.space.get(_.iris.rdf_type),
            result   = {'@id': this.id};
        for (let [predicate, relation] of this.#relations.entries()) {
            const key   = (predicate === rdf_type) ? '@type' : predicate.id;
            result[key] = relation.toJSON();
        }
        return result;
    } // Node#toJSON

    // TODO

}; // Node
