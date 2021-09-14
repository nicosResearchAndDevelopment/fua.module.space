const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Literal {

    #space = null;
    #term  = null;

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Literal#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Literal#constructor : expected space to be a Space', TypeError);
        _.assert(space.factory.isLiteral(term), 'Literal#constructor : expected term to be a Literal', TypeError);
        this.#space = space;
        this.#term  = term;
    } // Literal#constructor

    get term() {
        return this.#term;
    }

    get value() {
        return this.#term.value;
    }

    get language() {
        return this.#term.language;
    }

    get datatype() {
        return this.#space.getNode(this.#term.datatype);
    }

    toJSON() {
        if (this.#term.language) {
            return {
                '@value':    this.#term.value,
                '@language': this.#term.language
            };
        } else {
            return {
                '@value': this.#term.value,
                '@type':  this.#term.datatype.value
            };
        }
    } // Literal#toJSON

}; // Literal
