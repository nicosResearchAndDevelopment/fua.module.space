const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

module.exports = class Literal {

    constructor(secret, value, language, datatype) {
        _.assert(secret === _.SECRET, 'Literal#constructor : private method is not accessible');
        _.assert(_.isString(value), 'Literal#constructor : expected value to be a string', TypeError);
        _.assert(_.isString(language), 'Literal#constructor : expected language to be a string', TypeError);
        _.assert(datatype instanceof _space.Node, 'Literal#constructor : expected datatype to be a Node', TypeError);
        this.value    = value;
        this.language = language;
        this.datatype = datatype;
        _.lockAllProp(this);
    } // Literal#constructor

}; // Literal
