const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

/** @alias fua.module.space.Resource */
module.exports = class Resource {

    #node;

    /**
     * @param {fua.module.space.Node} node
     */
    constructor(node) {
        _.assert(node instanceof _space.Node, 'Resource#constructor : expected node to be a Node', TypeError);
        this['@id'] = node.id;
        this.#node  = node;
        _.lockProp(this, '@id');
    } // Resource#constructor

    /** @type {fua.module.space.Node} */
    get node() {
        return this.#node;
    } // Resource#node

    toJSON() {
        return this.#node.toJSON();
    } // Resource#toJSON

    static isInstance(value) {
        return value instanceof this;
    } // Resource.isInstance

    static isClass(value) {
        return _.isFunction(value) && (
            value === this ||
            this.isPrototypeOf(value)
        );
    } // Resource.isClass

}; // Resource
