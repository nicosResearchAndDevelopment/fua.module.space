const
    util         = require('@nrd/fua.core.util'),
    EventEmitter = require("events"),
    _            = exports = module.exports = {
        ...util,
        assert: new util.Assert('module.space'),
        SECRET: Symbol('module.space')
    };

_.events = {
    node_created:  'node-created',
    node_loaded:   'node-loaded',
    node_saved:    'node-saved',
    node_cleared:  'node-cleared',
    node_cached:   'node-cached',
    node_uncached: 'node-uncached'
};

_.ontologies = {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    xsd: 'http://www.w3.org/2001/XMLSchema#'
};

_.iris = {
    rdf_type: _.ontologies.rdf + 'type',
    // rdf_List:       _.ontologies.rdf + 'List',
    // rdf_first:      _.ontologies.rdf + 'first',
    // rdf_rest:       _.ontologies.rdf + 'rest',
    // rdf_nil:        _.ontologies.rdf + 'nil',
    rdf_langString: _.ontologies.rdf + 'langString',
    xsd_string:     _.ontologies.xsd + 'string',
    xsd_boolean:    _.ontologies.xsd + 'boolean',
    xsd_decimal:    _.ontologies.xsd + 'decimal',
    xsd_integer:    _.ontologies.xsd + 'integer'
};

_.isNodeTerm = function (term) {
    return term && (
        term.termType === 'NamedNode' ||
        term.termType === 'BlankNode'
    );
};

_.isLiteralTerm = function (term) {
    return term && (
        term.termType === 'Literal'
    );
};

_.ProtectedEmitter = class ProtectedEmitter {

    #emitter = new EventEmitter();

    emit(secret, event, ...args) {
        _.assert(secret === _.SECRET, 'ProtectedEmitter#emit : private method is not accessible');
        _.assert(util.isString(event), 'ProtectedEmitter#emit : expected event to be a string', TypeError);
        this.#emitter.emit(event, ...args);
        return this;
    } // ProtectedEmitter#emit

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
