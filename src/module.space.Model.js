const
    EventEmitter = require('events'),
    util         = require('./module.space.util.js');

module.exports = class Model {

    #space   = null;
    #emitter = new EventEmitter();
    #builder = null;

    constructor(space, id, builder) {
        this.#space   = space;
        this.#builder = builder;
        this['@id']   = id;
        util.lockProp('@id');
    } // Model#constructor

    on(event, listener) {
        util.assert(util.isString(event), 'Model#on : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Model#on : expected listener to be a function', TypeError);
        this.#emitter.on(event, listener);
    } // Model#on

    once(event, listener) {
        util.assert(util.isString(event), 'Model#once : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Model#once : expected listener to be a function', TypeError);
        this.#emitter.once(event, listener);
    } // Model#once

    off(event, listener) {
        util.assert(util.isString(event), 'Model#off : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Model#off : expected listener to be a function', TypeError);
        this.#emitter.off(event, listener);
    } // Model#off

    _emit(secret, event, ...args) {
        util.assert(secret === util.SECRET, 'private method is not accessible');
        util.assert(util.isString(event), 'invalid event', TypeError);
        this.#emitter.emit(event, ...args);
    } // Model#_emit

    //

}; // Model
