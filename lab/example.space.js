const
    {Space} = require('../src/module.space.js'),
    LDP     = require('./example.model-ldp.js'),
    space   = new Space();

space.loadModel(LDP);

const
    hello = space.getNode('ex:hello_world');

hello
    .property('rdfs:label').add('Hello World!', 'en').add('Hallo Welt!', 'de')
    .property('rdf:type').add({'@id': 'ex:test'})
    .commit().then(console.log).catch(console.error);
