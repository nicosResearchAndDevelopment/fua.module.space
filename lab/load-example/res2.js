const { join: joinPath } = require('path');

module.exports = {
    'dct:identifier': './res2.js',
    'dct:format': 'application/fua.module.space+js',
    'dct:requires': [{
        'dct:identifier': joinPath(__dirname, 'res4.ttl'),
        'dct:format': 'text/turtle'
    }, {
        'dct:identifier': './res5.jsonld',
        'dct:format': 'application/ld+json'
    }]
};