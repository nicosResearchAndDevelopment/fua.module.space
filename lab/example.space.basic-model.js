const
    _      = require('../src/module.space.util.js'),
    _space = require('../src/module.space.js'),
    _model = exports,
    RDF    = _model.rdf = Object.create(null),
    RDFS   = _model.rdfs = Object.create(null),
    OWL    = _model.owl = Object.create(null),
    DC     = _model.dc = Object.create(null);

RDFS.Resource = class {

    #node = null;

    constructor(node) {
        if (node instanceof _space.Node) {
            this.#node  = node;
            this['@id'] = node.id;
        } else {
            _.assert(_.isObject(node) && _.isString(node['@id']), 'RDFS.Resource#constructor : expected node to be a Node', TypeError);
            this.#node  = node;
            this['@id'] = node['@id'];
        }
        _.lockProp(this, '@id');
    }

    get node() {
        return this.#node;
    }

}; // RDFS.Resource

Object.assign(RDFS.Resource, {
    '@id':              'rdfs:Resource',
    '@type':            'rdfs:Class',
    'rdfs:isDefinedBy': {'@id': 'http://www.w3.org/2000/01/rdf-schema#'},
    'rdfs:label':       {'@value': 'Resource'},
    'rdfs:Comment':     {'@value': 'The class resource, everything.'}
});

RDFS.Class = class extends RDFS.Resource {

    constructor() {
        _.assert(false, 'RDFS.Class#constructor : not instantiable, extend RDFS.Resource instead');
        super();
    }

    static [Symbol.hasInstance](value) {
        return _.isFunction(value) && (
            RDFS.Resource === value ||
            RDFS.Resource.isPrototypeOf(value)
        );
    }

}; // RDFS.Class

Object.assign(RDFS.Class, {
    '@id':              'rdfs:Class',
    '@type':            'rdfs:Class',
    'rdfs:isDefinedBy': {'@id': 'http://www.w3.org/2000/01/rdf-schema#>'},
    'rdfs:label':       {'@value': 'Class'},
    'rdfs:comment':     {'@value': 'The class of classes.'},
    'rdfs:subClassOf':  {'@id': 'rdfs:Resource'}
});

RDF.Property = class extends RDFS.Resource {

    // applyTo(target, value) {
    //     _.assert(target instanceof RDFS.Resource, 'RDF.Property#applyTo : expected target to be an RDFS.Resource', TypeError);
    //     const prop = this['@id'];
    //     Object.defineProperty(target, prop, {
    //         get: function () {
    //             return this.node?.getNodes(prop);
    //         }
    //     });
    // }

}; // RDF.Property

Object.assign(RDF.Property, {
    '@id':              'rdf:Property',
    '@type':            'rdfs:Class',
    'rdfs:isDefinedBy': {'@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#>'},
    'rdfs:label':       {'@value': 'Property'},
    'rdfs:comment':     {'@value': 'The class of RDF properties.'},
    'rdfs:subClassOf':  {'@id': 'rdfs:Resource'}
});

RDFS.label = new RDF.Property({
    '@id':              'rdfs:label',
    '@type':            'rdf:Property',
    'rdfs:isDefinedBy': {'@id': 'http://www.w3.org/2000/01/rdf-schema#'},
    'rdfs:label':       {'@value': 'label'},
    'rdfs:comment':     {'@value': 'A human-readable name for the subject.'},
    'rdfs:domain':      {'@id': 'rdfs:Resource'},
    'rdfs:range':       {'@id': 'rdfs:Literal'}
});
