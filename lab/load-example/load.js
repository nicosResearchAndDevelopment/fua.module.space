const
    { join: joinPath } = require('path'),
    persistence = require('@nrd/fua.module.persistence'),
    loadSpace = require('../../next/module.space.load.js'),
    rdfSerializer = require('rdf-serialize').default,
    { Readable } = require('stream'),
    { inspect } = require('util');

(async (/* async-iife */) => {

    const resArr = await loadSpace({
        'dct:identifier': joinPath(__dirname, './res1.json'),
        'dct:format': 'application/fua.module.space+json'
    });

    const resData = persistence.dataset();

    for (let res of resArr) {
        if (res.dataset) resData.add(res.dataset);
    }

    const outputStream = rdfSerializer.serialize(Readable.from(resData), { contentType: 'application/ld+json' });

    const result = JSON.parse(await new Promise((resolve, reject) => {
        const chunks = [];
        outputStream
            .on('data', chunk => chunks.push(chunk))
            .on('error', reject)
            .on('end', () => resolve(chunks.join('')));
    }));

    console.log(inspect(result, false, Infinity, true));
    debugger;

})(/* async-iife */).catch(console.error);