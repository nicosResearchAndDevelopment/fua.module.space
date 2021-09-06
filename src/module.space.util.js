const
    util = require('@nrd/fua.core.util');

exports = module.exports = {
    ...util,
    assert: new util.Assert('module.space')
};
