const
    EventEmitter = require('events'),
    util         = require('./module.space.util.js');

module.exports = class Resource {

    #space   = null;
    #emitter = new EventEmitter();

    constructor(space, id) {
        this.#space = space;
        this['@id'] = id;
        util.lockProp('@id');
    } // Resource#constructor

    on(event, listener) {
        util.assert(util.isString(event), 'Resource#on : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Resource#on : expected listener to be a function', TypeError);
        this.#emitter.on(event, listener);
    } // Resource#on

    once(event, listener) {
        util.assert(util.isString(event), 'Resource#once : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Resource#once : expected listener to be a function', TypeError);
        this.#emitter.once(event, listener);
    } // Resource#once

    off(event, listener) {
        util.assert(util.isString(event), 'Resource#off : expected event to be a string', TypeError);
        util.assert(util.isFunction(listener), 'Resource#off : expected listener to be a function', TypeError);
        this.#emitter.off(event, listener);
    } // Resource#off

    _emit(secret, event, ...args) {
        util.assert(secret === util.SECRET, 'private method is not accessible');
        util.assert(util.isString(event), 'invalid event', TypeError);
        this.#emitter.emit(event, ...args);
    } // Resource#_emit

}; // Resource
