const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

class Model {

    #classes  = new Map();
    #finished = false;

    has(classId) {
        return this.#classes.has(classId);
    }

    get(classId) {
        return this.#classes.get(classId) || null;
    }

    set(classId, ResourceClass) {
        _.assert(!this.#finished, 'TODO');
        _.assert(_.isString(classId), 'TODO', TypeError);
        _.assert(_space.Resource.isClass(ResourceClass), 'TODO', TypeError);
        _.assert(!this.#classes.has(classId), 'TODO');
        this.#classes.set(classId, ResourceClass);
        return this;
    }

    finish() {
        _.assert(!this.#finished, 'TODO');
        this.#finished = true;
        return this;
    }

    builder(space) {
        _.assert(this.#finished, 'TODO');
        _.assert(space instanceof _space.Space, 'TODO', TypeError);
        return async (id, ...args) => {
            const node = space.getNode(id);
            if (!node.isLoaded('@type')) await node.load('@type');
            const types           = _.toArray(node.type);
            const resourceClasses = types.map(type => this.#classes.get(type)).filter(val => val);
            if (resourceClasses.length > 1) {
                resourceClasses.sort((ClassA, ClassB) => {
                    if (ClassA.isPrototypeOf(ClassB)) return 1;
                    if (ClassB.isPrototypeOf(ClassA)) return -1;
                    _.assert(false, 'class is not obvious');
                });
            }
            const ResourceClass = resourceClasses[0] || _space.Resource;
            return new ResourceClass(node, ...args);
        };
    }

} // Model

module.exports = Model;
