const
    _            = require('./module.space.util.js'),
    _persistence = require('@nrd/fua.module.persistence'),
    _space       = require('./module.space.js');

module.exports = class Space extends _.ProtectedEmitter {

    /** @type {Map<string, WeakRef<_space.Node>>} */
    #nodes     = new Map();
    /** @type {Map<string, Model>} */
    #models    = new Map();
    /** @type {_persistence.Dataset} */
    #typeSet   = null;
    /** @type {_persistence.DataStore} */
    #dataStore = null;

    // getNode(id) {
    //     if (_.isObject(id) && _.isString(id['@id'])) id = id['@id'];
    //     else _.assert(_.isString(id), 'Space#getNode : expected id to be a string or an identifiable', TypeError);
    //
    //     let
    //         ref  = this.#nodes.get(id),
    //         node = ref.deref();
    //
    //     if (!node) {
    //         node = new Resource(this, id);
    //         ref  = new WeakRef(node);
    //         this.#nodes.set(id, ref);
    //     }
    //
    //     return node;
    // } // Space#getNode

    _getDataStore(secret) {
        _.assert(secret === _.SECRET, 'private method is not accessible');
        return this.#dataStore;
    } // Space#_getDataStore

    _getTypeSet(secret) {
        _.assert(secret === _.SECRET, 'private method is not accessible');
        return this.#typeSet;
    } // Space#_getTypeSet

}; // Space
