const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Literal {

    #space;
    #factory;
    #term;

    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Literal#constructor : protected method');
        this.#space   = space;
        this.#factory = space.getStore(_.SECRET).factory;
        this.#term    = term;
    } // Literal#constructor

    getSpace(secret) {
        _.assert(secret === _.SECRET, 'Literal#getSpace : protected method');
        return this.#space;
    } // Node#getSpace

    get value() {
        return this.#term.value;
    } // Literal#value

    get language() {
        return this.#term.language;
    } // Literal#language

    get datatype() {
        return this.#space.getNode(this.#term.datatype);
    } // Literal#datatype

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

    valueOf() {
        const xsd_boolean = this.#factory.namedNode(_.iris.xsd_boolean);
        if (xsd_boolean.equals(this.#term.datatype)) {
            return !['false', 'null', 'off', 'no', 'n', 'f', '0', '']
                .includes(this.#term.value.toLowerCase());
        }
        const xsd_integer = this.#factory.namedNode(_.iris.xsd_integer);
        if (xsd_integer.equals(this.#term.datatype)) {
            return parseInt(this.#term.value);
        }
        const xsd_decimal = this.#factory.namedNode(_.iris.xsd_decimal);
        if (xsd_decimal.equals(this.#term.datatype)) {
            return parseFloat(this.#term.value);
        }
        return this.#term.value;
    } // Literal#valueOf

}; // Literal
