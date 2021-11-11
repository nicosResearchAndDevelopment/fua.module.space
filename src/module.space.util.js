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

    rdf_List:  _.ontologies.rdf + 'List',
    rdf_first: _.ontologies.rdf + 'first',
    rdf_rest:  _.ontologies.rdf + 'rest',
    rdf_nil:   _.ontologies.rdf + 'nil',

    rdf_langString: _.ontologies.rdf + 'langString',

    xsd_string:           _.ontologies.xsd + 'string',
    xsd_language:         _.ontologies.xsd + 'language',
    xsd_normalizedString: _.ontologies.xsd + 'normalizedString',
    xsd_token:            _.ontologies.xsd + 'token',

    xsd_dateTime:   _.ontologies.xsd + 'dateTime',
    xsd_date:       _.ontologies.xsd + 'date',
    xsd_time:       _.ontologies.xsd + 'time',
    xsd_duration:   _.ontologies.xsd + 'duration',
    xsd_gDay:       _.ontologies.xsd + 'gDay',
    xsd_gMonth:     _.ontologies.xsd + 'gMonth',
    xsd_gMonthDay:  _.ontologies.xsd + 'gMonthDay',
    xsd_gYear:      _.ontologies.xsd + 'gYear',
    xsd_gYearMonth: _.ontologies.xsd + 'gYearMonth',

    xsd_decimal:            _.ontologies.xsd + 'decimal',
    xsd_integer:            _.ontologies.xsd + 'integer',
    xsd_nonNegativeInteger: _.ontologies.xsd + 'nonNegativeInteger',
    xsd_positiveInteger:    _.ontologies.xsd + 'positiveInteger',
    xsd_nonPositiveInteger: _.ontologies.xsd + 'nonPositiveInteger',
    xsd_negativeInteger:    _.ontologies.xsd + 'negativeInteger',
    xsd_byte:               _.ontologies.xsd + 'byte',
    xsd_unsignedByte:       _.ontologies.xsd + 'unsignedByte',
    xsd_int:                _.ontologies.xsd + 'int',
    xsd_unsignedInt:        _.ontologies.xsd + 'unsignedInt',
    xsd_long:               _.ontologies.xsd + 'long',
    xsd_unsignedLong:       _.ontologies.xsd + 'unsignedLong',
    xsd_short:              _.ontologies.xsd + 'short',
    xsd_unsignedShort:      _.ontologies.xsd + 'unsignedShort',

    xsd_boolean:      _.ontologies.xsd + 'boolean',
    xsd_float:        _.ontologies.xsd + 'float',
    xsd_double:       _.ontologies.xsd + 'double',
    xsd_anyURI:       _.ontologies.xsd + 'anyURI',
    xsd_hexBinary:    _.ontologies.xsd + 'hexBinary',
    xsd_base64Binary: _.ontologies.xsd + 'base64Binary'
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

_.xsdParsers = Object.freeze({
    // String Data Types
    string(value) {
        // A string
        return value;
    },
    language(value) {
        // A string that contains a valid language id
        return _.xsdParsers.string(value);
    },
    normalizedString(value) {
        // A string that does not contain line feeds, carriage returns, or tabs
        return _.xsdParsers.string(value);
    },
    token(value) {
        // A string that does not contain line feeds, carriage returns, tabs, leading or trailing spaces, or multiple spaces
        return _.xsdParsers.string(value);
    },
    // Date and Time Data Types
    dateTime(value) {
        // Defines a date and time value
        return new Date(value);
    },
    date(value) {
        // Defines a date value
        return _.xsdParsers.string(value);
    },
    time(value) {
        // Defines a time value
        return _.xsdParsers.string(value);
    },
    duration(value) {
        // Defines a time interval
        return _.xsdParsers.string(value);
    },
    gDay(value) {
        // Defines a part of a date - the day (DD)
        return _.xsdParsers.string(value);
    },
    gMonth(value) {
        // Defines a part of a date - the month (MM)
        return _.xsdParsers.string(value);
    },
    gMonthDay(value) {
        // Defines a part of a date - the month and day (MM-DD)
        return _.xsdParsers.string(value);
    },
    gYear(value) {
        // Defines a part of a date - the year (YYYY)
        return _.xsdParsers.string(value);
    },
    gYearMonth(value) {
        // Defines a part of a date - the year and month (YYYY-MM)
        return _.xsdParsers.string(value);
    },
    // Numeric Data Types
    decimal(value) {
        // A decimal value
        return parseFloat(value);
    },
    integer(value) {
        // An integer value
        return parseInt(value);
    },
    byte(value) {
        // A signed 8-bit integer
        return _.xsdParsers.integer(value);
    },
    int(value) {
        // A signed 32-bit integer
        return _.xsdParsers.integer(value);
    },
    long(value) {
        // A signed 64-bit integer
        return _.xsdParsers.integer(value);
    },
    negativeInteger(value) {
        // An integer containing only negative values (..,-2,-1)
        return _.xsdParsers.integer(value);
    },
    nonNegativeInteger(value) {
        // An integer containing only non-negative values (0,1,2,..)
        return _.xsdParsers.integer(value);
    },
    nonPositiveInteger(value) {
        // An integer containing only non-positive values (..,-2,-1,0)
        return _.xsdParsers.integer(value);
    },
    positiveInteger(value) {
        // An integer containing only positive values (1,2,..)
        return _.xsdParsers.integer(value);
    },
    short(value) {
        // A signed 16-bit integer
        return _.xsdParsers.integer(value);
    },
    unsignedLong(value) {
        // An unsigned 64-bit integer
        return _.xsdParsers.integer(value);
    },
    unsignedInt(value) {
        // An unsigned 32-bit integer
        return _.xsdParsers.integer(value);
    },
    unsignedShort(value) {
        // An unsigned 16-bit integer
        return _.xsdParsers.integer(value);
    },
    unsignedByte(value) {
        // An unsigned 8-bit integer
        return _.xsdParsers.integer(value);
    },
    // Miscellaneous Data Types
    boolean(value) {
        return !['false', 'null', 'off', 'no', 'n', 'f', '0', ''].includes(value.toLowerCase());
    },
    hexBinary(value) {
        // Hexadecimal-encoded binary data
        return Buffer.from(value, 'hex');
    },
    base64Binary(value) {
        // Base64-encoded binary data
        return Buffer.from(value, 'base64');
    },
    anyURI(value) {
        // An URI
        return _.xsdParsers.string(value);
    },
    float(value) {
        // A 32-bit floating point number
        return _.xsdParsers.decimal(value);
    },
    double(value) {
        // A 64-bit double precision floating point number
        return _.xsdParsers.decimal(value);
    }
});

module.exports = _;
