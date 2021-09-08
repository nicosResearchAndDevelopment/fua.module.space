const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Pointer extends _.ProtectedEmitter {

    #space   = null;
    #dataset = null;

    constructor(secret, space, dataset) {
        _.assert(secret === _.SECRET, 'Node#constructor : private method is not accessible');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        _.assert(dataset instanceof _persistence.Dataset, 'Node#constructor : expected dataset to be a Dataset', TypeError);
        _.assert(dataset.factory === space.factory, 'Node#constructor : expected dataset to have the same factory as the space');
        super();
        this.#space   = space;
        this.#dataset = dataset;
    } // Pointer#constructor

    // SEE https://zazuko.github.io/clownface/#/

}; // Pointer
