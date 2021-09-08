const _ = require('./module.space.util.js');

exports.Literal  = require('./module.space.Literal.js');
exports.Node     = require('./module.space.Node.js');
exports.Property = require('./module.space.Property.js');
exports.Resource = require('./module.space.Resource.js');
exports.Model    = require('./module.space.Model.js');
exports.Space    = require('./module.space.Space.js');

_.lockAllProp(exports);
