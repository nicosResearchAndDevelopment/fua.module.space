const
    _           = exports,
    MODULE_NAME = 'module.space';

_.assert = function (value, errMsg = 'undefined error', errType = Error) {
    if (!value) {
        const err = new errType(`${MODULE_NAME} : ${errMsg}`);
        Error.captureStackTrace(err, _.assert);
        throw err;
    }
};

_.lockProp = function (obj, ...keys) {
    const lock = {writable: false, configurable: false};
    for (let key of keys) {
        Object.defineProperty(obj, key, lock);
    }
};

_.strValidator = function (pattern) {
    return (value) => _.isString(value) && pattern.test(value);
};

_.strToRegex = function (string, flags) {
    const specialCharMatcher = /[./\\+*?([{|^$]/g;
    new RegExp(string.replace(specialCharMatcher, (match) => '\\' + match), flags);
};

_.isDefined = function (value) {
    //return value !== undefined;
    return value !== void 0;
};

_.isTruthy = function (value) {
    return !!value;
};

_.isFalsy = function (value) {
    return !value;
};

_.isBoolean = function (value) {
    return typeof value === 'boolean';
};

_.isString = function (value) {
    return typeof value === 'string';
};

_.isObject = function (value) {
    return value && typeof value === 'object';
};

_.isArray = Array.isArray;