const
    util  = require('./util.js'),
    model = require('.');

exports.Resource = class {

    #node;

    constructor(node) {
        util.assert(node instanceof util.Node);
        this.#node  = node;
        this['@id'] = node.id;
        util.lockProp(this, '@id');
    }

    get node() {
        return this.#node;
    }

};

exports.Class = class extends model.RDFS.Resource {

    constructor() {
        util.assert('RDFS.Class#constructor : not instantiable, extend RDFS.Resource instead');
        super();
    }

    static [Symbol.hasInstance](value) {
        return util.isFunction(value) && (
            model.RDFS.Resource === value ||
            model.RDFS.Resource.isPrototypeOf(value)
        );
    }

};

exports.Literal = class extends model.RDFS.Resource {

    static [Symbol.hasInstance](value) {
        return util.isFunction(value) && (
            model.RDFS.Resource === value ||
            model.RDFS.Resource.isPrototypeOf(value)
        );
    }

};

exports.Datatype = class extends model.RDFS.Class {

    constructor() {
        util.assert('RDFS.Class#constructor : not instantiable, extend RDFS.Literal instead');
        super();
    }

    static [Symbol.hasInstance](value) {
        return util.isFunction(value) && (
            model.RDFS.Literal === value ||
            model.RDFS.Literal.isPrototypeOf(value)
        );
    }

};
