exports.loader = {
    '@context': { '@base': 'universe#' },
    '@id': 'file://{resourcePath}resource.universe\\script\\test.universe.js',
    '@type': 'fua/load',
    'rdfs:label': 'load.nicos',
    'fua:dop': true,
    'fua:verbose': 'none', // TODO: "all"
    //
    'fua:load': [
        //region SafetyControl
        {
            '@id': 'file://{resourcePath}resource.ontologies\\fua\\safetyControl\\load.saco.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.saco.js',
            'fua:dop': true
        }
        //region SafetyControl SHAPES
        , {
            '@id': 'file://{resourcePath}resource.ontologies\\fua\\safetyControl\\validation\\load.saco.validation.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.saco.validation.js',
            'fua:dop': true
        }
        //endregion SafetyControl SHAPES
        //region SafetyControl EXAMPLE Alice and Bob
        , {
            '@id': 'file://{resourcePath}resource.ontologies\\fua\\safetyControl\\example\\load.saco.test.AliceBob.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.saco.test.AliceBob.js',
            'fua:dop': true
        }
        //endregion SafetyControl EXAMPLE Alice and Bob
        //endregion SafetyControl
        //region Universe
        //region Universe Earth
        , {
            '@id': 'file://{resourcePath}resource.universe\\earth\\load.uni.earth.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.uni.earth.js',
            'fua:dop': true
        }
        //endregion Universe Earth
        //region Universe Person
        , {
            //C:\fua_resources\resource.universe\person\load.uni.person.js
            '@id': 'file://{resourcePath}resource.universe\\person\\load.uni.person.js',
            //'@id':   "file://{resourcePath}resource.universe\\person\\load.uni.person.js",
            '@type': 'fua/load',
            'rdfs:label': 'load.uni.person.js',
            'fua:dop': true
            //'load_files': []
        }
        //endregion Universe Person
        //endregion Universe
        //region  Fraunhofer
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\person\\fh.person.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.person.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\fh.org.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.organization.ttl',
            'fua:dop': true
        }
        //region Fraunhofer AISEC
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\aisec\\person\\fh.aisec.person.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.aisec.person.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\aisec\\employee\\fh.aisec.employee.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.aisec.employee.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\aisec\\fh.aisec.org.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.aisec.organization.ttl',
            'fua:dop': true
        }
        //endregion Fraunhofer AISEC
        //region Fraunhofer FIT
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\fit\\person\\fh.fit.person.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.fit.person.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\fit\\employee\\fh.fit.employee.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.fit.employee.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\fit\\fh.fit.org.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.fit.organization.ttl',
            'fua:dop': true
        }
        //endregion Fraunhofer FIT
        //region Fraunhofer IAIS
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\iais\\person\\fh.iais.person.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.iais.person.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\iais\\employee\\fh.iais.employee.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.iais.employee.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\iais\\fh.iais.org.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.iais.organization.ttl',
            'fua:dop': true
        }
        //endregion Fraunhofer IAIS
        //region Fraunhofer ISST
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\isst\\person\\fh.isst.person.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.isst.person.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\isst\\employee\\fh.isst.employee.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.isst.employee.ttl',
            'fua:dop': true
        }, {
            '@id': 'file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\isst\\fh.isst.org.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'fraunhofer.isst.organization.ttl',
            'fua:dop': true
        }
        //endregion Fraunhofer ISST
        //endregion  Fraunhofer
        //region IDS
        //region IDS : Association
        , {
            '@context': {
                '@base': 'universe#'
            },
            '@id': 'file://{resourcePath}resource.universe\\organization\\idsa\\load.idsa.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.idsa.js',
            'fua:dop': true
        }
        //endregion IDS : Association
        //endregion IDS
        //region nicos
        , {
            '@context': {
                '@base': 'universe#'
            },
            '@id': 'file://{resourcePath}resource.universe\\organization\\nicos\\ag\\load.nicos.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.nicos.js',
            'fua:dop': true
        }
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\nicos\\ag\\alignment\\ids\\participant\\nicos.ids.participant.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'nicos.ids.participant.ttl',
            'fua:dop': true
        }
        , {
            '@id': 'file://{resourcePath}resource.universe\\organization\\nicos\\ag\\alignment\\gax\\participant\\nicos.gax.participant.ttl',
            '@type': 'text/turtle',
            'rdfs:label': 'nicos.gax.participant.ttl',
            'fua:dop': true
        }
        //endregion nicos
        //region Eco System
        //region Eco System GAIA-X
        //region Eco System GAIA-X :: REPO
        , {
            '@context': {
                '@base': 'universe#'
            },
            '@id': 'file://{resourcePath}resource.universe\\ecosystem\\gax\\repo\\load.gax.repo.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.gax.repo.js',
            'fua:dop': true
        }
        //endregion Eco System GAIA-X :: REPO
        , {
            '@context': {
                '@base': 'universe#'
            },
            '@id': 'file://{resourcePath}resource.universe\\organization\\gaxa\\load.gaxa.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.gaxa.js',
            'fua:dop': true
        }
        , {
            '@context': {
                '@base': 'universe#'
            },
            '@id': 'file://{resourcePath}resource.universe\\ecosystem\\gax\\ec\\load.gax.ec.js',
            '@type': 'fua/load',
            'rdfs:label': 'load.gaxa.js',
            'fua:dop': true
        }
        //endregion Eco System GAIA-X
        //region Eco System : IDS

        //endregion Eco System : IDS
        //endregion Eco System
    ] // fua:load
}; // exports.loader
