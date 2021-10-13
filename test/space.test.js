const
    expect                 = require('expect'),
    {describe, test}       = require('mocha'),
    {Space, Node, Literal} = require('../src/module.space.js'),
    context                = require('./context.json'),
    {DataFactory}          = require('@nrd/fua.module.persistence'),
    InmemoryStore          = require('@nrd/fua.module.persistence.inmemory');

describe('module.space', function () {

    describe('Space', function () {

        let factory, store, space;
        before('construct a Space', function () {
            factory = new DataFactory(context);
            store   = new InmemoryStore(null, factory);
            space   = new Space({store});
        });

        test('TODO', function () {
            expect(space).toBeInstanceOf(Space);
            // TODO
        });

    });

});
