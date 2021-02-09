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

_.strValidator = function(pattern) {
    return (value) => _.isString(value) && pattern.test(value);
};

_.strToRegex = function(string, flags) {
    const specialCharMatcher = /[./\\+*?([{|^$]/g;
    new RegExp(string.replace(specialCharMatcher, (match) => '\\' + match), flags);
};

_.isString = function(value) {
    return typeof value === 'string';
};

_.isObject = function(value) {
    return value && typeof value === 'object';
};