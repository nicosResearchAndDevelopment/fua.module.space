const
    _util  = require('@nrd/fua.core.util'),
    _space = require('@nrd/fua.module.space');

exports = module.exports = {
    ..._util,
    ..._space,
    assert: _util.Assert('module.space/model')
};
