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

        describe('Space#get', function () {

            test('get a Node with an iri string', function () {
                const node = space.get('ex:test');
                expect(node).toBeInstanceOf(Node);
                expect(node.id).toBe('ex:test');
            });

            test('get a Node with another Node', function () {
                const nodeA = space.get('ex:test');
                const nodeB = space.get(nodeA);
                expect(nodeB).toBeInstanceOf(Node);
                expect(nodeB.id).toBe(nodeA.id);
            });

            test('get a Node with an identifiable', function () {
                const node = space.get({'@id': 'ex:test'});
                expect(node).toBeInstanceOf(Node);
            });

            test('get always the same Node', function () {
                const nodeA = space.get('ex:test');
                const nodeB = space.get(nodeA);
                const nodeC = space.get({'@id': nodeA.id});
                expect(nodeA).toBe(nodeB);
                expect(nodeB).toBe(nodeC);
            });

            test('get a Node with a NamedNode term', function () {
                const node = space.get(factory.namedNode('ex:test'));
                expect(node).toBeInstanceOf(Node);
                expect(node.id).toBe('ex:test');
            });

            test('get a Node with a BlankNode term', function () {
                const node = space.get(factory.blankNode('123'));
                expect(node).toBeInstanceOf(Node);
                expect(node.id).toBe('_:123');
            });

            test('get a Literal with a second language option', function () {
                const literal = space.get('Hello World!', 'en');
                expect(literal).toBeInstanceOf(Literal);
                expect(literal.value).toBe('Hello World!');
                expect(literal.language).toBe('en');
            });

            test('get a Literal with a json-ld literal', function () {
                const literal = space.get({'@value': 'Hello World!', '@language': 'en'});
                expect(literal).toBeInstanceOf(Literal);
                expect(literal.value).toBe('Hello World!');
                expect(literal.language).toBe('en');
            });

            test('get a Literal with a Literal term', function () {
                const literal = space.get(factory.literal('lorem ipsum'));
                expect(literal).toBeInstanceOf(Literal);
                expect(literal.value).toBe('lorem ipsum');
            });

            test('get always the same Literal', function () {
                const literalA = space.get('Hello World!', 'en');
                const literalB = space.get(literalA);
                const literalC = space.get({'@value': 'Hello World!', '@language': 'en'});
                expect(literalA).toBe(literalB);
                expect(literalB).toBe(literalC);
            });

            test('get a Literal with a non iri string', function () {
                const literal = space.get('lorem ipsum');
                expect(literal).toBeInstanceOf(Literal);
                expect(literal.value).toBe('lorem ipsum');
            });

            test('get a Literal with an iri string but the Literal class as option', function () {
                const literal = space.get('ex:test', Literal);
                expect(literal).toBeInstanceOf(Literal);
                expect(literal.value).toBe('ex:test');
            });

        });

    });

});
