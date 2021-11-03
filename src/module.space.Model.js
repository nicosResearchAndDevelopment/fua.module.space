const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

class Model {

    #classes  = new Map();
    #finished = false;

    has(classId) {
        return this.#classes.has(classId);
    } // Model#has

    get(classId) {
        return this.#classes.get(classId) || null;
    } // Model#get

    set(classId, ResourceClass) {
        _.assert(!this.#finished, 'Model#set : this model is already finished');
        _.assert(_.isString(classId), 'Model#set : expected classId to be a string', TypeError);
        _.assert(!this.#classes.has(classId), 'Model#set : expected classId to be unique');
        _.assert(_space.Resource.isClass(ResourceClass), 'Model#set : expected ResourceClass to be a subclass of space Resource', TypeError);
        this.#classes.set(classId, ResourceClass);
        return this;
    } // Model#set

    finish() {
        _.assert(!this.#finished, 'Model#finish : this model is already finished');
        this.#finished = true;
        return this;
    } // Model#finish

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

    builder(space) {
        _.assert(this.#finished, 'Model#builder : this model is not finished yet');
        _.assert(space instanceof _space.Space, 'Model#builder : expected space to be a space Space', TypeError);
        return async (id, ...args) => {
            const node = space.getNode(id);
            return await this.build(node, ...args);
        };
    } // Model#builder

} // Model

module.exports = Model;
