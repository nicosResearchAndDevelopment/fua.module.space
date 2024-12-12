const
    _util  = require('@fua/core.util'),
    _space = require('@fua/module.space');

exports = module.exports = {
    ..._util,
    ..._space,
    assert: _util.Assert('module.space/model')
};
