const
    {describe, before, test} = require('mocha'),
    expect                   = require('expect'),
    {join: joinPath}         = require('path'),
    resourcePath             = process.env.FUA_RESOURCES,
    {generateGraph}          = require('@nrd/fua.module.rdf'),
    context                  = require('./context.json'),
    {DataFactory}            = require('@nrd/fua.module.persistence'),
    Space                    = require('../next/module.space.js');

describe('module.space : load-universe', function () {

    this.timeout(0);

    let space;
    before('initialize space', async function () {
        space = new Space({factory: new DataFactory(context)});
        try {
            await space.load({
                'dct:format':     'application/fua.module.space+js',
                'dct:identifier': joinPath(resourcePath, 'resource.universe/script/test.next-universe.js')
            });
        } catch (err) {
            debugger;
            throw err;
        }
    });

    test('test', async function () {
        const graph = generateGraph(space.localData);
        console.log(graph);
        debugger;
    });

});