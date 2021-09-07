const
    util  = require('@nrd/fua.core.util'),
    space = require('./module.space.js'),
    LDP   = new space.Model('http://www.w3.org/ns/ldp#');

module.exports = (space) => {

};

exports.BasicContainer = new space.Model(
    'http://www.w3.org/ns/ldp#BasicContainer',
    {
        async ldp_contains() {
            await this.read();
            return util.toArray(this['ldp:contains']).map();
        }
    }
);
