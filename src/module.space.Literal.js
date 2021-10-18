const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Literal {

    /** @type {import('./module.space.js').Space} */
    #space;
    /** @type {import('@nrd/fua.module.persistence').DataFactory} */
    #factory;
    #term;

    /**
     * @param {Symbol} secret
     * @param {_space.Space} space
     * @param {_persistence.Term} term
     * @protected
     */
    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Literal#constructor : protected method');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        this.#space   = space;
        this.#factory = space.getFactory(_.SECRET);
        this.#term    = term;
    } // Literal#constructor

    /**
     * @param {Symbol} secret
     * @returns {_space.Space}
     * @protected
     */
    getSpace(secret) {
        _.assert(secret === _.SECRET, 'Literal#getSpace : protected method');
        return this.#space;
    } // Literal#getSpace

    /** @type {_persistence.Term} */
    get term() {
        return this.#term;
    } // Literal#term

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
