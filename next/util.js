const
    _ = exports,
    MODULE_NAME = 'module.space';

_.assert = function(value, errMsg = 'undefined error', errType = Error) {
    if (!value) {
        const err = new errType(`${MODULE_NAME} : ${errMsg}`);
        Error.captureStackTrace(err, _.assert);
        throw err;
    }
};

_.isString = function(value) {
    return typeof value === 'string';
};

_.isObject = function(value) {
    return value && typeof value === 'object';
};