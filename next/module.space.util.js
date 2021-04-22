const
    _           = exports,
    util        = require('@nrd/fua.core.util'),
    MODULE_NAME = 'module.space';

_.assert     = new util.Assert(MODULE_NAME);
_.hideProp   = util.hideProp;
_.lockProp   = util.lockProp;
_.isDefined  = util.isDefined;
_.isString   = util.isString;
_.isObject   = util.isObject;
_.isFunction = util.isFunction;
_.isArray    = util.isArray;
_.isIterable = util.isIterable;

_.nodeToId = function (node) {
    return node['@id'];
};

_.literalToValue = function (node) {
    return node['@value'];
};