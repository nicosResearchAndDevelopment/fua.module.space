const
    expect                       = require('expect'),
    {describe, test, beforeEach} = require('mocha'),
    {Space, Node, Literal}       = require('../src/module.space.js'),
    context                      = require('./context.json'),
    {DataFactory}                = require('@nrd/fua.module.persistence'),
    InmemoryStore                = require('@nrd/fua.module.persistence.inmemory');

describe('module.space', function () {

    describe('Space', function () {

        let factory, store, space;
        beforeEach('construct a Space', function () {
            factory = new DataFactory(context);
            store   = new InmemoryStore(null, factory);
            space   = new Space({store});
        });

        test('TODO', async function () {
            expect(space).toBeInstanceOf(Space);
            const node = space.getNode('ex:hello');
            await node.load();
            node.type = 'ex:Hello';
            console.log(node.id, node.type);
            node.type = ['rdfs:Resource', {'@id': 'ex:Hello'}];
            // await node.load(['ex:test']);
            // await node.load(['ex:test2']);
            node.setLiteral('ex:test', 'Hello World!', 'en');
            node.setNodes('ex:test2', ['ex:lorem', 'ex:ipsum']);
            console.log(store.dataset.size);
            // await node.save();
            await node.save(['ex:test', '@type']);
            // await node.save('ex:test2');
            console.log(store.dataset.size);
            console.log(node.id, node.type);
            console.log(node.toJSON());
            // TODO
        });

    });

});
