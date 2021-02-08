const
    { join: joinPath } = require('path'),
    loadSpace = require('../../next/module.space.load.js');

(async (/* async-iife */) => {

    const resArr = await loadSpace({
        'dct:identifier': joinPath(__dirname, './res1.json'),
        'dct:format': 'application/fua.module.space+json'
    });

    console.log(resArr);
    debugger;

})(/* async-iife */).catch(console.error);