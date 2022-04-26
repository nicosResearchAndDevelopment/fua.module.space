const _ = require('./module.space.util.js');

/** @type {typeof fua.module.space.Space} */
exports.Space = require('./module.space.Space.js');
/** @type {typeof fua.module.space.Node} */
exports.Node = require('./module.space.Node.js');
/** @type {typeof fua.module.space.Literal} */
exports.Literal = require('./module.space.Literal.js');

/** @type {typeof fua.module.space.Model} */
exports.Model = require('./module.space.Model.js');
/** @type {typeof fua.module.space.Resource} */
exports.Resource = require('./module.space.Resource.js');

// TODO Datatype
// TODO Property -> ObjectProperty and DatatypeProperty
// TODO List

_.lockAllProp(exports);
