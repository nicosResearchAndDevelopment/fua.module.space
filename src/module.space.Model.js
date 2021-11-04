const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

/** @alias fua.module.space.Model */
module.exports = class Model {

    #classes  = new Map();
    #finished = false;

    /**
     * @param {string} classId
     * @returns {boolean}
     */
    has(classId) {
        return this.#classes.has(classId);
    } // Model#has

    /**
     * @param {string} classId
     * @returns {function | null}
     */
    get(classId) {
        return this.#classes.get(classId) || null;
    } // Model#get

    /**
     * @param {string} classId
     * @param {function} ResourceClass
     * @returns {this}
     */
    set(classId, ResourceClass) {
        _.assert(!this.#finished, 'Model#set : this model is already finished');
        _.assert(_.isString(classId), 'Model#set : expected classId to be a string', TypeError);
        _.assert(!this.#classes.has(classId), 'Model#set : expected classId to be unique');
        _.assert(_space.Resource.isClass(ResourceClass), 'Model#set : expected ResourceClass to be a subclass of space Resource', TypeError);
        this.#classes.set(classId, ResourceClass);
        return this;
    } // Model#set

    keys() {
        return this.#classes.keys();
    } // Model#keys

    values() {
        return this.#classes.values();
    } // Model#values

    entries() {
        return this.#classes.entries();
    } // Model#entries

    integrate(model) {
        _.assert(!this.#finished, 'Model#integrate : this model is already finished');
        _.assert(model instanceof Model, 'Model#set : expected model to be a space Model', TypeError);
        for (let [key, value] of model.entries()) {
            this.set(key, value);
        }
        return this;
    } // Model#integrate

    /**
     * @returns {this}
     */
    finish() {
        _.assert(!this.#finished, 'Model#finish : this model is already finished');
        this.#finished = true;
        return this;
    } // Model#finish

    /**
     * @param {fua.module.space.Node} node
     * @param {...any} args
     * @returns {Promise<fua.module.space.Resource>}
     */
    async build(node, ...args) {
        _.assert(this.#finished, 'Model#build : this model is not finished yet');
        _.assert(node instanceof _space.Node, 'Model#build : expected node to be a space Node', TypeError);
        if (!node.isLoaded('@type')) await node.load('@type');
        const resourceClasses = _.toArray(node.type).map(type => this.#classes.get(type)).filter(val => val);
        if (resourceClasses.length > 1) {
            resourceClasses.sort((ClassA, ClassB) => {
                if (ClassA.isPrototypeOf(ClassB)) return 1;
                if (ClassB.isPrototypeOf(ClassA)) return -1;
                _.assert(false, 'class is not obvious');
            });
        }
        const ResourceClass = resourceClasses[0] || _space.Resource;
        return new ResourceClass(node, ...args);
    } // Model#build

    /**
     * @param {fua.module.space.Space} space
     * @param {...any} baseArgs
     * @returns {function(id: string, ...any): Promise<fua.module.space.Resource>}
     */
    builder(space, ...baseArgs) {
        _.assert(this.#finished, 'Model#builder : this model is not finished yet');
        _.assert(space instanceof _space.Space, 'Model#builder : expected space to be a space Space', TypeError);
        return async (id, ...args) => {
            const node = space.getNode(id);
            return await this.build(node, ...baseArgs, ...args);
        };
    } // Model#builder

}; // Model
