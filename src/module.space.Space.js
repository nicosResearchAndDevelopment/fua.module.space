const
    util                              = require('./module.space.util.js'),
    EventEmitter                      = require('events'),
    {Dataset, DataStore, DataFactory} = require('@nrd/fua.module.persistence'),
    Resource                          = require('./module.space.resource.js'),
    Model                             = require('./module.space.model.js');

module.exports = class Space {

    /** @type {Map<string, WeakRef<Resource>>} */
    #resources = new Map();
    /** @type {Map<string, Model>} */
    #models    = new Map();
    /** @type {Dataset} */
    #typeSet   = null;
    /** @type {DataStore} */
    #dataStore = null;
    /** @type {EventEmitter} */
    #emitter   = new EventEmitter();

    on(event, listener) {
        util.assert(util.isString(event), 'Space#on : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Space#on : expected listener to be a function', TypeError);
        this.#emitter.on(event, listener);
    } // Space#on

    once(event, listener) {
        util.assert(util.isString(event), 'Space#once : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Space#once : expected listener to be a function', TypeError);
        this.#emitter.once(event, listener);
    } // Space#once

    off(event, listener) {
        util.assert(util.isString(event), 'Space#off : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Space#off : expected listener to be a function', TypeError);
        this.#emitter.off(event, listener);
    } // Space#off

    _emit(secret, event, ...args) {
        util.assert(secret === util.SECRET, 'private method is not accessible');
        util.assert(util.isString(event), 'invalid event', TypeError);
        this.#emitter.emit(event, ...args);
    } // Space#_emit

    // getNode(id) {
    //     if (util.isObject(id) && util.isString(id['@id'])) id = id['@id'];
    //     else util.assert(util.isString(id), 'Space#getNode : expected id to be a string or an identifiable', TypeError);
    //
    //     let
    //         ref  = this.#resources.get(id),
    //         node = ref.deref();
    //
    //     if (!node) {
    //         node = new Resource(this, id);
    //         ref  = new WeakRef(node);
    //         this.#resources.set(id, ref);
    //     }
    //
    //     return node;
    // } // Space#getNode

    // createModel(id, builder) {
    //     if (util.isObject(id) && util.isString(id['@id'])) id = id['@id'];
    //     else util.assert(util.isString(id), 'Space#createModel : expected id to be a string or an identifiable', TypeError);
    //     util.assert(util.isFunction(builder), 'Space#createModel : expected builder to be a function', TypeError);
    //     util.assert(!this.#models.has(id), 'Space#createModel : expected id to be unique');
    //     const model = new Model(id, builder);
    //     this.#models.set(this, id, model);
    //     return model;
    // } // Space#createModel

    _getDataStore(secret) {
        util.assert(secret === util.SECRET, 'private method is not accessible');
        return this.#dataStore;
    } // Space#_getDataStore

    _getTypeSet(secret) {
        util.assert(secret === util.SECRET, 'private method is not accessible');
        return this.#typeSet;
    } // Space#_getTypeSet

}; // Space
