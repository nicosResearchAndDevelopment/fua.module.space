const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

module.exports = class Resource {

    constructor(node, id) {
        _.assert(node instanceof _space.Node, 'Resource#constructor : expected node to be a Node', TypeError);
        _.assert(_.isString(id), 'Resource#constructor : expected id to be a string', TypeError);
        this.node = node;
        _.hideProp(this, 'node');
        this['@id'] = id;
        _.lockProp(this, 'node', '@id');
    } // Resource#constructor

}; // Resource
