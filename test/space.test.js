const
    expect                       = require('expect'),
    {describe, test, beforeEach} = require('mocha'),
    path                         = require('path'),
    {Space, Node, Literal}       = require('../src/module.space.js'),
    context                      = require('./data/context.json'),
    {DataFactory, Dataset}       = require('@nrd/fua.module.persistence'),
    InmemoryStore                = require('@nrd/fua.module.persistence.inmemory'),
    {loadDataFiles}              = require('@nrd/fua.module.rdf');
const ldp_model                  = require("./data/ldp-model.js");

describe('module.space', function () {

    describe('Space', function () {

        let factory, store, space;
        beforeEach('construct a Space', function () {
            factory = new DataFactory(context);
            store   = new InmemoryStore(null, factory);
            space   = new Space({store});

            const quadToString = (quad) => `(${factory.termToId(quad.subject)})-[${factory.termToId(quad.predicate)}]->(${factory.termToId(quad.object)})`;

            store.on('added', quad => console.log('added:', quadToString(quad)));
            store.on('deleted', quad => console.log('deleted:', quadToString(quad)));
            store.on('error', err => console.error(err?.stack ?? err));

            space.on('node-created', node => console.log('node-created:', node.id));
            space.on('node-loaded', node => console.log('node-loaded:', node.id));
            space.on('node-saved', node => console.log('node-saved:', node.id));
            space.on('node-cleared', node => console.log('node-cleared:', node.id));
            space.on('node-cached', id => console.log('node-cached:', id));
            space.on('node-uncached', id => console.log('node-uncached:', id));
        });

        test('should construct nodes and literals', function () {
            expect(space).toBeInstanceOf(Space);

            const
                ex_hello = factory.namedNode('http://example.org/stuff/1.0/hello'),
                node_1   = space.getNode('ex:hello'),
                node_2   = space.getNode(ex_hello),
                node_3   = space.getNode({'@id': 'ex:hello'}),
                node_4   = space.getNode(node_2);

            expect(node_1).toBeInstanceOf(Node);
            expect(node_2).toBe(node_1);
            expect(node_3).toBe(node_1);
            expect(node_4).toBe(node_1);

            const
                _123    = factory.blankNode('123'),
                blank_1 = space.getNode('_:123'),
                blank_2 = space.getNode(_123),
                blank_3 = space.getNode({'@id': '_:123'}),
                blank_4 = space.getNode(blank_2);

            expect(blank_1).toBeInstanceOf(Node);
            expect(blank_1).not.toBe(node_1);
            expect(blank_2).toBe(blank_1);
            expect(blank_3).toBe(blank_1);
            expect(blank_4).toBe(blank_1);

            const
                xsd_decimal = factory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'),
                _hello      = factory.literal('hello', 'en'),
                literal_1   = space.getLiteral('hello'),
                literal_2   = space.getLiteral('hello', 'en'),
                literal_3   = space.getLiteral(_hello),
                literal_4   = space.getLiteral(literal_2),
                literal_5   = space.getLiteral({'@value': 'hello'}),
                literal_6   = space.getLiteral('123', xsd_decimal),
                literal_7   = space.getLiteral('123', {'@id': 'xsd:decimal'});

            expect(literal_1).toBeInstanceOf(Literal);
            expect(literal_2.value).toBe(literal_1.value);
            expect(literal_2.term.equals(literal_1.term)).toBeFalsy();
            expect(literal_3.term.equals(literal_2.term)).toBeTruthy();
            expect(literal_4.toJSON()).toMatchObject(literal_2.toJSON());
            expect(literal_5.term.equals(literal_1.term)).toBeTruthy();
            expect(literal_6 + 1).toBe(124);
            expect(literal_7.term.equals(literal_6.term)).toBeTruthy();
            expect(literal_7.term.equals(literal_1.term)).toBeFalsy();
        });

        test('should load and save nodes', async function () {
            expect(space).toBeInstanceOf(Space);
            expect(await store.size()).toBe(0);

            const hello = space.getNode('ex:hello');
            await hello.load();
            hello.type = 'ex:Hello';
            hello.setLiterals('rdfs:label', [
                {'@value': 'Hello', '@language': 'en'},
                {'@value': 'Hallo', '@language': 'de'}
            ]);
            hello.setNode('ex:lorem', 'ex:ipsum');

            expect(await store.size()).toBe(0);
            await hello.save();
            expect(await store.size()).toBe(4);

            hello.type = [hello.type, 'rdfs:Resource'];
            hello.deleteLiterals('rdfs:label');
            hello.setNodes('ex:lorem', ['ex:ipsum', 'ex:ipsum', {'@id': 'ex:lorem_ipsum'}]);

            expect(await store.size()).toBe(4);
            await hello.save('rdfs:label');
            expect(await store.size()).toBe(2);
            await hello.save('@type');
            expect(await store.size()).toBe(3);
            await hello.save();
            expect(await store.size()).toBe(4);

            expect(hello.toJSON()).toEqual({
                '@id':      'ex:hello',
                '@type':    ['ex:Hello', 'rdfs:Resource'],
                'ex:lorem': [{'@id': 'ex:ipsum'}, {'@id': 'ex:lorem_ipsum'}]
            });
            hello.clear();
            expect(hello.toJSON()).toEqual({'@id': 'ex:hello'});

            await hello.load('rdfs:label');
            await hello.setLiteral('rdfs:label', 'Hello World!');
            expect(hello.getLiteral('rdfs:label').value).toBe('Hello World!');
            await hello.save();

            expect(await store.size()).toBe(5);
            await store.deleteMatches(null, factory.namedNode('ex:lorem'));
            expect(await store.size()).toBe(3);

            await hello.load();
            expect(hello.toJSON()).toEqual({
                '@id':        'ex:hello',
                '@type':      ['ex:Hello', 'rdfs:Resource'],
                'rdfs:label': [{'@value': 'Hello World!', '@type': 'xsd:string'}]
            });
        });

        test('should search for nodes and literals', async function () {
            expect(space).toBeInstanceOf(Space);

            await store.add([
                factory.quad(factory.namedNode('ex:1'), factory.namedNode('ex:a'), factory.namedNode('ex:2')),
                factory.quad(factory.namedNode('ex:1'), factory.namedNode('ex:a'), factory.namedNode('ex:3')),
                factory.quad(factory.namedNode('ex:1'), factory.namedNode('ex:a'), factory.namedNode('ex:4')),
                factory.quad(factory.namedNode('ex:2'), factory.namedNode('ex:a'), factory.namedNode('ex:3')),
                factory.quad(factory.namedNode('ex:2'), factory.namedNode('ex:a'), factory.namedNode('ex:4')),
                factory.quad(factory.namedNode('ex:3'), factory.namedNode('ex:a'), factory.namedNode('ex:4')),
                factory.quad(factory.namedNode('ex:4'), factory.namedNode('ex:b'), factory.namedNode('ex:3')),
                factory.quad(factory.namedNode('ex:4'), factory.namedNode('ex:b'), factory.namedNode('ex:2')),
                factory.quad(factory.namedNode('ex:4'), factory.namedNode('ex:b'), factory.namedNode('ex:1')),
                factory.quad(factory.namedNode('ex:3'), factory.namedNode('ex:b'), factory.namedNode('ex:2')),
                factory.quad(factory.namedNode('ex:3'), factory.namedNode('ex:b'), factory.namedNode('ex:1')),
                factory.quad(factory.namedNode('ex:2'), factory.namedNode('ex:b'), factory.namedNode('ex:1')),
                factory.quad(factory.namedNode('ex:1'), factory.namedNode('ex:c'), factory.literal('example', 'en')),
                factory.quad(factory.namedNode('ex:1'), factory.namedNode('ex:c'), factory.literal('Beispiel', 'de')),
                factory.quad(factory.namedNode('ex:2'), factory.namedNode('ex:c'), factory.literal('123', factory.namedNode('xsd:decimal')))
            ]);

            const
                search_a = await space.findObjects('ex:a'),
                search_b = await space.findSubjects('ex:b', 'ex:2'),
                search_c = await space.findObjects('ex:c', 'ex:1'),
                search_d = await space.findSubjects('ex:c', {'@value': '123', '@type': 'xsd:decimal'});

            expect(search_a).toHaveLength(3);
            expect(search_b).toHaveLength(2);
            expect(search_c).toHaveLength(2);
            expect(search_d).toHaveLength(1);

            for (let node of search_a) {
                expect(node).toBeInstanceOf(Node);
            }
            for (let node of search_c) {
                expect(node).toBeInstanceOf(Literal);
            }
        });

        test.skip('experimental', async function () {
            expect(space).toBeInstanceOf(Space);
            const node = space.getNode('ex:hello');
            await node.load();
            // await node.load(['ex:test']);
            // await node.load(['ex:test2']);

            node.type = 'ex:Hello';
            console.log(node.id, node.type);
            node.type = ['rdfs:Resource', {'@id': 'ex:Hello'}];
            node.setLiteral('ex:test', 'Hello World!', 'en');
            node.setNodes('ex:test2', ['ex:lorem', 'ex:ipsum']);

            console.log(await store.size());
            // await node.save();
            await node.save(['ex:test', '@type']);
            console.log(await store.size());

            console.log(node.id, node.type);
            console.log(node.toJSON());

            console.log(await space.findSubjects('ex:test2', 'ex:ipsum'));
            await node.save('ex:test2');
            console.log(await space.findSubjects('ex:test2', 'ex:ipsum'));
            console.log(await space.findObjects('ex:test2'));
            // TODO
        });

    });

    describe('Model', function () {

        let factory, store, space;
        beforeEach('construct a Space', function () {
            factory = new DataFactory(context);
            store   = new InmemoryStore(null, factory);
            space   = new Space({store});

            space.on('node-created', node => console.log('node-created:', node.id));
            space.on('node-loaded', node => console.log('node-loaded:', node.id));
            space.on('node-saved', node => console.log('node-saved:', node.id));
            space.on('node-cleared', node => console.log('node-cleared:', node.id));
            space.on('node-cached', id => console.log('node-cached:', id));
            space.on('node-uncached', id => console.log('node-uncached:', id));
        });

        describe('LDP', function () {

            let ldp_model, ldp_builder;
            beforeEach('load LDP model', async function () {
                const [dataFile] = await loadDataFiles({
                    'dct:format':     'text/turtle',
                    'dct:identifier': path.join(__dirname, 'data/ldp-example.ttl')
                }, factory);
                expect(dataFile?.dataset).toBeInstanceOf(Dataset);

                await store.add(dataFile.dataset);
                expect(await store.size()).toBeGreaterThan(0);

                ldp_model   = require('./data/ldp-model.js');
                ldp_builder = ldp_model.builder(space);
                expect(typeof ldp_builder).toBe('function');
            });

            test('should build ldp nodes', async function () {
                const root = await ldp_builder('http://localhost/');
                expect(root).toBeInstanceOf(ldp_model.get('ldp:Container'));
                console.log(root);
                console.log(await root.contains());
            });

        });

    });

});
