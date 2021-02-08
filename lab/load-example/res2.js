const { join: joinPath } = require('path');

module.exports = {
    'dct:identifier': './res2.js',
    'dct:format': 'application/fua.module.space+js',
    'dct:requires': [{
        // 'dct:identifier': joinPath(__dirname, 'res3.ttl'),
        'dct:identifier': './res3.ttl',
        'dct:format': 'text/turtle'
    }]
};