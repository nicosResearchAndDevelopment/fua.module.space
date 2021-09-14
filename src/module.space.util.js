const
    util         = require('@nrd/fua.core.util'),
    EventEmitter = require("events"),
    _            = exports = module.exports = {
        ...util,
        assert: new util.Assert('module.space'),
        SECRET: Symbol('module.space'),
        events: {
            node_created: 'node-created'
        },
        iris:   {
            rdf_type:       'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            rdf_langString: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
            xsd_string:     'http://www.w3.org/2001/XMLSchema#string',
            xsd_boolean:    'http://www.w3.org/2001/XMLSchema#boolean',
            xsd_decimal:    'http://www.w3.org/2001/XMLSchema#decimal',
            xsd_integer:    'http://www.w3.org/2001/XMLSchema#integer'
        }
    };

_.ProtectedEmitter = class ProtectedEmitter {

    #emitter = new EventEmitter();

    _emit(secret, event, ...args) {
        _.assert(secret === _.SECRET, 'ProtectedEmitter#_emit : private method is not accessible');
        _.assert(util.isString(event), 'ProtectedEmitter#_emit : expected event to be a string', TypeError);
        this.#emitter.emit(event, ...args);
        return this;
    } // ProtectedEmitter#_emit

    on(event, listener) {
        _.assert(util.isString(event), 'ProtectedEmitter#on : expected event to be a string', TypeError);
        _.assert(util.isFunction(listener), 'ProtectedEmitter#on : expected listener to be a function', TypeError);
        this.#emitter.on(event, listener);
        return this;
    } // ProtectedEmitter#on

    once(event, listener) {
        _.assert(util.isString(event), 'ProtectedEmitter#once : expected event to be a string', TypeError);
        _.assert(util.isFunction(listener), 'ProtectedEmitter#once : expected listener to be a function', TypeError);
        this.#emitter.once(event, listener);
        return this;
    } // ProtectedEmitter#once

    off(event, listener) {
        _.assert(util.isString(event), 'ProtectedEmitter#off : expected event to be a string', TypeError);
        _.assert(util.isFunction(listener), 'ProtectedEmitter#off : expected listener to be a function', TypeError);
        this.#emitter.off(event, listener);
        return this;
    } // ProtectedEmitter#off

}; // ProtectedEmitter

module.exports = _;
