const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _termParsers = new WeakMap();

function getTermParser(factory) {
    if (_termParsers.has(factory))
        return _termParsers.get(factory);

    const
        _valueParsers = new Map(),
        _addParser    = (value, parser) => _valueParsers.set(factory.namedNode(value).value, parser),
        termParser    = (term) => (_valueParsers.get(term.datatype.value) || _.xsdParsers.string)(term.value);

    _addParser(_.iris.xsd_string, _.xsdParsers.string);
    _addParser(_.iris.xsd_boolean, _.xsdParsers.boolean);
    _addParser(_.iris.xsd_integer, _.xsdParsers.integer);
    _addParser(_.iris.xsd_decimal, _.xsdParsers.decimal);

    _termParsers.set(factory, termParser);
    return termParser;
} // getTermParser

/** @alias fua.module.space.Literal */
module.exports = class Literal {

    #space;
    #factory;
    #term;

    /**
     * @param {Symbol} secret
     * @param {fua.module.space.Space} space
     * @param {fua.module.persistence.Literal} term
     */
    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Literal#constructor : protected method');
        _.assert(space instanceof _space.Space, 'Literal#constructor : expected space to be a Space', TypeError);
        this.#space   = space;
        this.#factory = space.getFactory(_.SECRET);
        this.#term    = term;
    } // Literal#constructor

    /**
     * @param {Symbol} secret
     * @returns {fua.module.space.Space}
     */
    getSpace(secret) {
        _.assert(secret === _.SECRET, 'Literal#getSpace : protected method');
        return this.#space;
    } // Literal#getSpace

    /** @type {fua.module.persistence.Literal} */
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
        const
            termParser = getTermParser(this.#factory),
            value      = termParser(this.#term);
        return value;
    } // Literal#valueOf

}; // Literal
