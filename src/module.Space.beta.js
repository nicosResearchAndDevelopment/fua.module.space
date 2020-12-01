module.exports = () => {

    const
        libPath      = process.env.FUA_JS_LIB,
        resourcePath = process.env.FUA_RESOURCES,
        remotePath   = process.env.FUA_REMOTES,
        fua          = global['fua'],
        hrt          = fua['core']['hrt'],
        uuid         = fua['core']['uuid']
    ; // const

    //region fn
    function Weaktypes(weaktypes) {
        Object.defineProperties(this, {
            'has': {
                value: (type) => {
                    return weaktypes.has(((typeof type === "string") ? type : type['@id']));
                }
            },
            'get': {
                value: (types) => {
                    let
                        typesIsArray = Array.isArray(types),
                        result       = []
                    ;
                    types            = ((typesIsArray) ? types : [types]);
                    types.forEach((type) => {
                        let _type,
                            _URI = ((typeof type === "string") ? type : type['@id'])
                        ;
                        _type    = weaktypes.get(_URI);
                        if (_type)
                            result.push(_type);
                    });
                    return ((typesIsArray) ? result : result[0]);
                } // value
            } // get
        }); // Object.defineProperties(this)

        return () => {
            return weaktypes;
        };
    } // function Weaktypes ()

    function Weaknodes(weaknodes) {

        Object.defineProperties(this, {
            'set': {
                value: (nodes) => {
                    nodes = ((Array.isArray(nodes)) ? nodes : [nodes]);
                    nodes.forEach((node) => {
                        let _node = ((typeof node === "string") ? {'@id': node} : ((node['@type']) ? node : undefined));
                        if (_node)
                            weaknodes.set(_node['@id'], _node);
                    });
                }
            },
            'has': {
                value: (node) => {
                    let _URI = ((typeof node === "string") ? node : node['@id']);
                    return weaknodes.has(_URI);
                }
            },
            'get': {
                value: (nodes) => {
                    let
                        nodesIsArray = Array.isArray(nodes),
                        result       = []
                    ;
                    nodes            = ((nodesIsArray) ? nodes : [nodes]);
                    nodes.forEach((node) => {
                        let _node,
                            _URI = ((typeof node === "string") ? node : node['@id'])
                        ;

                        _node = weaknodes.get(_URI);
                        if (_node)
                            result.push(_node);
                    });
                    return ((nodesIsArray) ? result : result[0]);
                } // value
            } // get
        }); // Object.defineProperties(this)

        return () => {
            return weaknodes;
        };

    } // function Weaktypes ()

    const verbose_level = ["none", "load", "dop_false", "all", "error", "debug"];

    function doVerbose(level, message) {
        level = ((typeof level === "string") ? verbose_level.indexOf(level) : level);
        if (verbose_level.indexOf(level) <= verbose_mode) {
            if (level >= verbose_level.indexOf("error")) {
                console.warn(`load : ${message}`);
            } else {
                console.log(`load : ${message}`);
            } // if ()
        }
    } // doVerbose()
    let
        verbose_mode                 = 1, /** set at runtime */
        /** hidden */ __isTopLevel__ = true
    ;

    function getTopLevel() {
        let cached     = __isTopLevel__;
        __isTopLevel__ = false;
        return cached;
    } // getTopLevel()

    function tweakPath(path, isFile) {

        if (isFile)
            path = path.replace("file://", "");

        return path
            .replace("{resourcePath}", resourcePath)
            .replace("{remotePath}", remotePath)
            ; // return
    } // tweakPath(path)

    function validation({
                            'result':  result,
                            'verbose': verbose = "none"
                        }) {

        return new Promise((validation_resolve, validation_reject) => {
            try {
                let
                    validation_result                 = {
                        'hasBeginning': ((new Date).valueOf() / 1000),
                        'startedAt':    (new Date).toISOString(),
                        // <null>: novalidation, <true>: positive, <object>: report
                        'value':        true
                    } // validation_result
                ;
                validation_result['report']           = result['dataset'].shaclValidate(result['shapeset'], /** mode */ undefined);
                validation_result['value']            = (validation_result['report']['results'].length === 0);
                validation_result['hasEnd']           = ((new Date).valueOf() / 1000);
                validation_result['runtimeInSeconds'] = (validation_result['hasEnd'] - validation_result['hasBeginning']);
                validation_result['endedAt']          = (new Date).toISOString();
                result['hasEnd']                      = validation_result['hasEnd'];
                result['endedAt']                     = (new Date).toISOString();
                result['runtimeInSeconds']            = (result['hasEnd'] - result['hasBeginning']);
                result['validation']                  = validation_result;
                validation_resolve(result);
            } catch (jex) {
                doVerbose("debug", `error <${jex.toString()}>`);
                validation_reject(jex);
            }  // try

        }); // rnP

    } // validation()

    //endregion fn

    class Space {

        #IM                           = null;
        #context                      = null; // !!!
        #root                         = "";
        #weaktypes                    = new WeakMap();
        #weaknodes                    = new WeakMap();
        #graph                        = new Map();
        #verbose_mode                 = /** set at runtime */ 1;
        /** hidden */ #__isTopLevel__ = true;

        //#agent_persistence = null;

        constructor(
            {
                '@context': context = null, // !!!
                'root':     root = ""
                //'graph':             graph = [],
                //'agent_persistence': agent_persistence = null // !!!
            } =
                {
                    'root':      "",
                    'resources': []
                }) {

            this.#context = context;
            this.#root    = (root || "/space");
            //this.#graph   = new Map();
            //this.#agent_persistence = agent_persistence;
            //if (graph && (graph['length'] > 0)) {
            //    graph.forEach((node) => {
            //        return set_(this.#graph, node);
            //    });
            //} // if ()
            Object.defineProperties(this, {
                '@context':  {value: this.#context},
                'root':      {value: this.#root},
                'map':       {value: this.#graph},
                '@graph':    {get: () => [...this.#graph.values()]},
                'URIs':      {get: () => this.#graph.keys()},
                'IM':        {
                    set: (IM) => {
                        if (!this.#IM)
                            this.#IM = IM;
                    },
                    get: () => {
                        return this.#IM;
                    }
                }, // IM
                'weaktypes': {value: new Weaktypes(this.#weaktypes)},
                'weaknodes': {value: new Weaknodes(this.#weaknodes)},
                'load':      {
                    value: ({
                                '@context':    context,
                                '@id':         id,
                                '@type':       type,
                                'rdfs:label':  label,
                                'fua:dop':     dop = true,
                                'fua:verbose': verbose = "all", // TODO: "all"
                                //
                                'dataset':     dataset = new fua['module']['Dataset'](),
                                'shapeset':    shapeset = new fua['module']['Dataset'](),
                                'index':       index = new Set(),
                                'fua:load':    load_files = []
                            }) => {

                        return new Promise((load_resolve, load_reject) => {
                            try {
                                this.#verbose_mode = ((typeof verbose === "string") ? verbose_level.indexOf(verbose) : verbose);
                                const

                                    _top_level_    = getTopLevel()
                                ;
                                let
                                    _file_path,
                                    promises       = [],
                                    result         = {
                                        'hasBeginning': ((new Date).valueOf() / 1000),
                                        'startedAt':    (new Date).toISOString(),
                                        'dataset':      dataset,
                                        'shapeset':     shapeset,
                                        'endedAt':      undefined
                                    } // result
                                ; // let

                                if (dop) {
                                    //region files
                                    switch (type) {
                                        case "text/turtle":
                                            _file_path = tweakPath(id);
                                            if (!index.has(_file_path)) {

                                                doVerbose(verbose_mode, `read '${type}' <${(label || _file_path)}>`);

                                                index.add(_file_path);

                                                dataset.loadTTL(_file_path)
                                                    .then((loadTTL_result) => {
                                                        if (load_files.length > 0) {
                                                            load_files.map((load_file) => {

                                                                _file_path = tweakPath(load_file['@id']);

                                                                if (!index.has(_file_path)) {
                                                                    switch (load_file['@type']) {
                                                                        case "application/ld+json":
                                                                        case "text/turtle":
                                                                            // TODO: verbose fua.dop === false
                                                                            load_file['@context'] = context;
                                                                            load_file['verbose']  = verbose;
                                                                            load_file['shapeset'] = shapeset;
                                                                            load_file['dataset']  = dataset;
                                                                            load_file['index']    = index;
                                                                            promises.push(this.load(load_file));
                                                                            break;
                                                                        default:
                                                                            doVerbose("error", `error :  file to load has wrong file type <${load_file['@type']}>.`);
                                                                            break; // default
                                                                    } // switch(resource['@type'])
                                                                } // if ()
                                                            }); // load_resources.map(resource)

                                                            Promise.all(promises).then((loc_result) => {
                                                                if (_top_level_) {
                                                                    validation({
                                                                        'result':  result,
                                                                        'verbose': verbose
                                                                    }).then((/** true || report */ validation_result) => {
                                                                        result['endedAt'] = (new Date).toISOString();
                                                                        load_resolve(result);
                                                                    }).catch((err) => {
                                                                        doVerbose("error", `error : on validation <${err.toString()}>.`);
                                                                        load_reject(err);
                                                                    });
                                                                } else {
                                                                    load_resolve(result);
                                                                } // if (_top_level_)
                                                            }).catch((err) => {
                                                                doVerbose("error", `error : <${err.toString()}>.`);
                                                                load_reject(err);
                                                            }); // Promise.all()

                                                        } else {

                                                            if (_top_level_) {
                                                                validation({
                                                                    'result':  result,
                                                                    'verbose': verbose
                                                                }).then((/** true || report */ validation_result) => {
                                                                    result['endedAt'] = (new Date).toISOString();
                                                                    load_resolve(validation_result);
                                                                }).catch(load_reject);
                                                            } else {
                                                                load_resolve(result);
                                                            } // if (_top_level_)

                                                        } // if ()
                                                    })
                                                    .catch((loadTTL_err) => {
                                                        doVerbose("error", `error : on 'loadTTL_err' : <${loadTTL_err.toString()}>`);
                                                        load_reject(loadTTL_err);
                                                    }); // dataset.loadTTL(tweakPath(id))
                                            } else {
                                                if (_top_level_) {
                                                    validation({
                                                        'result':  result,
                                                        'verbose': verbose
                                                    }).then((/** true || report */ validation_result) => {
                                                        result['endedAt'] = (new Date).toISOString();
                                                        load_resolve(result);
                                                    }).catch((err) => {
                                                        doVerbose("error", `error : on validation <${err.toString()}>.`);
                                                        load_reject(err);
                                                    });
                                                } else {
                                                    load_resolve(result);
                                                } // if (_top_level_)
                                            } // if ()
                                            break; // text/turtle
                                        case "application/ld+json":
                                            break; // application/ld+json
                                        case "text/sh+turtle":
                                            _file_path = tweakPath(id);
                                            if (!index.has(_file_path)) {

                                                doVerbose(verbose_mode, `read '${type}' <${(label || _file_path)}>`);

                                                index.add(_file_path);

                                                shapeset.loadTTL(_file_path)
                                                    .then((loadTTL_result) => {
                                                        if (load_files.length > 0) {
                                                            load_files.map((load_file) => {

                                                                _file_path = tweakPath(load_file['@id']);

                                                                if (!index.has(_file_path)) {
                                                                    switch (load_file['@type']) {
                                                                        case "text/sh+turtle":
                                                                            // TODO: verbose fua.dop === false
                                                                            load_file['@context'] = context;
                                                                            load_file['verbose']  = verbose;
                                                                            load_file['shapeset'] = shapeset;
                                                                            load_file['dataset']  = dataset;
                                                                            load_file['index']    = index;
                                                                            promises.push(this.load(load_file));
                                                                            break;
                                                                        default:
                                                                            doVerbose("error", `error :  file to load is NOT a shape <${load_file['@type']}> on file <${id}>.`);
                                                                            break; // default
                                                                    } // switch(resource['@type'])
                                                                } // if ()
                                                            }); // load_resources.map(resource)

                                                            Promise.all(promises).then((loc_result) => {
                                                                if (_top_level_) {
                                                                    validation({
                                                                        'result':  result,
                                                                        'verbose': verbose
                                                                    }).then((/** true || report */ validation_result) => {
                                                                        result['endedAt'] = (new Date).toISOString();
                                                                        load_resolve(result);
                                                                    }).catch((err) => {
                                                                        doVerbose("error", `error : on validation <${err.toString()}>.`);
                                                                        load_reject(err);
                                                                    });
                                                                } else {
                                                                    load_resolve(result);
                                                                } // if (_top_level_)
                                                            }).catch((err) => {
                                                                doVerbose("error", `error : <${err.toString()}>.`);
                                                                load_reject(err);
                                                            }); // Promise.all()

                                                        } else {

                                                            if (_top_level_) {
                                                                validation({
                                                                    'result':  result,
                                                                    'verbose': verbose
                                                                }).then((/** true || report */ validation_result) => {
                                                                    result['endedAt'] = (new Date).toISOString();
                                                                    load_resolve(validation_result);
                                                                }).catch(load_reject);
                                                            } else {
                                                                load_resolve(result);
                                                            } // if (_top_level_)

                                                        } // if ()
                                                    })
                                                    .catch((loadTTL_err) => {
                                                        doVerbose("error", `error : on 'loadTTL_err' : <${loadTTL_err.toString()}>`);
                                                        load_reject(loadTTL_err);
                                                    }); // dataset.loadTTL(tweakPath(id))
                                            } else {
                                                //if (_top_level_) {
                                                //    validation({
                                                //        'result':  result,
                                                //        'verbose': verbose
                                                //    }).then((/** true || report */ validation_result) => {
                                                //        result['endedAt'] = (new Date).toISOString();
                                                //        load_resolve(result);
                                                //    }).catch((err) => {
                                                //        doVerbose("error", `error : on validation <${err.toString()}>.`);
                                                //        load_reject(err);
                                                //    });
                                                //} else {
                                                //    load_resolve(result);
                                                //} // if (_top_level_)
                                            } // if ()
                                            break; // text/sh+turtle
                                        case "fua/load":

                                            _file_path = tweakPath(id, /**isFile */ true);

                                            if (!index.has(_file_path)) {
                                                let
                                                    promises = [],
                                                    {loader} = require(_file_path)
                                                ;
                                                doVerbose(verbose_mode, `read '${type}' <${(label || _file_path)}>`);

                                                index.add(_file_path);

                                                if (loader['fua:load'].length > 0) {
                                                    loader['fua:load'].map((file) => {

                                                        switch (file['@type']) {
                                                            case "text/turtle":
                                                                file['@context'] = context;
                                                                //REM: !!! loc_resource['fua:dop']  = true;
                                                                // TODO: verbose fua.dop === false
                                                                file['verbose']  = verbose;
                                                                file['shapeset'] = shapeset;
                                                                file['dataset']  = dataset;
                                                                file['index']    = index;
                                                                promises.push(this.load(file));
                                                                break; // text/turtle
                                                            case "application/ld+json":
                                                                // TODO: application/ld+json
                                                                break; // application/ld+json
                                                            case "text/sh+turtle":
                                                                file['@context'] = context;
                                                                //REM: !!! loc_resource['fua:dop']  = true;
                                                                // TODO: verbose fua.dop === false
                                                                file['verbose']  = verbose;
                                                                file['shapeset'] = shapeset;
                                                                file['dataset']  = dataset;
                                                                file['index']    = index;
                                                                promises.push(this.load(file));
                                                                break; // application/ld+json
                                                            case "fua/load":
                                                                file['@context'] = context;
                                                                //REM: !!! loc_resource['fua:dop']  = true;
                                                                // TODO: verbose fua.dop === false
                                                                file['verbose']  = verbose;
                                                                file['shapeset'] = shapeset;
                                                                file['dataset']  = dataset;
                                                                file['index']    = index;
                                                                promises.push(this.load(file));
                                                                break; // application/ld+json
                                                            default:
                                                                // TODO: what is to do?!?
                                                                // TODO: verbose
                                                                doVerbose("error", `error : unkown file type <${file['@type']}>.`);
                                                                break; // default
                                                        } // switch(resource['@type'])

                                                    }); // load_resources.map(resource)
                                                } // if ()

                                                promises = promises.concat(load_files);

                                                Promise.all(promises).then((/** unused */ loc_result) => {
                                                    if (_top_level_) {
                                                        validation({
                                                            'result':  result,
                                                            'verbose': verbose
                                                        }).then((/** true || report */ validation_result) => {
                                                            result['endedAt'] = (new Date).toISOString();
                                                            load_resolve(result);
                                                        }).catch((err) => {
                                                            doVerbose("error", `error : on validation <${err.toString()}>.`);
                                                            load_reject(err);
                                                        }); // validation
                                                    } else {
                                                        load_resolve(result);
                                                    } // if (_top_level_)
                                                }).catch((err) => {
                                                    doVerbose("error", `error : <${err.toString()}>.`);
                                                    load_reject(err);
                                                }); // Promise.all()
                                            } // if ()
                                            break; // fua/load
                                        default:
                                            doVerbose("error", `error : unkown file type <${type}>`);
                                            break; // default
                                    } // switch(type)
                                    //endregion files
                                } else {
                                    // TODO: verbose
                                    doVerbose("dop_false", `warning : 'fua:dop' set to <false> on <${id}>.`);
                                    load_resolve(result);
                                } // if (dop)
                            } catch (jex) {
                                // TODO: verbose
                                doVerbose("error", `exception <${jex.toString()}>`);
                                load_reject(jex);
                            }  // try
                        }); // rnP
                    } // value
                }, // load
                'add':       {
                    value: async (nodes) => {
                        return new Promise((resolve, reject) => {
                            try {
                                let result = {
                                    'error':    null,
                                    'report':   [],
                                    'added':    [],
                                    'existing': [],
                                    'bads':     []
                                };

                                if (!nodes) { // error first
                                    result['error'] = {
                                        '@id':     uuid({'type': "default", 'prefix': `${this.#root}/`}),
                                        'fua:ts':  hrt(),
                                        'message': `parameter 'nodes' is empty`
                                    }
                                    result['report'].push(`error: ${result['error']['message']}`);
                                } else {
                                    nodes = ((Array.isArray(nodes) ? nodes : [nodes]));
                                    nodes['forEach']((node) => {
                                        if (typeof node === "object") {
                                            if (node['@id']) {
                                                let graph_node = this.#graph.get(node['@id']);
                                                if (!graph_node) {
                                                    this.#graph.set(node['@id'], node);
                                                    result['added'].push(node);
                                                    result['report'].push(`node <${node['@id']}> added to @graph.`);
                                                } else {
                                                    result['existing'].push({'node': node, 'graph_node': graph_node});
                                                    result['report'].push(`node <${node['@id']}> already in @graph.`);
                                                } // if ()
                                            } else {
                                                result['bads'].push(node);
                                            } // if ()
                                        } else {
                                            result['bads'].push(node);
                                        } // if ()
                                    }); // nodes.forEach((node))
                                } // if ()
                                resolve(result);
                            } catch (jex) {
                                reject(jex);
                            } // try
                        }); // rnP
                    } // value
                }, // add
                'has':       {
                    value: (node) => {
                        return ((typeof node === "string") ? !!this.#graph.get(node) : !!this.#graph.get(node['@id']));
                    }
                }, // has
                'get':       {
                    value: (nodes) => {
                        let
                            nodes_isArray = Array.isArray(nodes),
                            result        = []
                        ;
                        nodes             = ((nodes_isArray) ? nodes : [nodes]);
                        nodes.forEach((node) => {
                            let graph_node;
                            switch (typeof node) {
                                case "string":
                                    graph_node = this.#graph.get(node);
                                    break;
                                case "object":
                                    graph_node = this.#graph.get(node['@id']);
                                    break;
                                default:
                                    break;
                            } // switch
                            if (graph_node)
                                result.push(graph_node);
                        }); // nodes.forEach((node))
                        return result;
                    } // value
                }, // get
                'filter':    {
                    value: async (fn) => {
                        let
                            result = []
                        ;
                        await (async () => {
                            await this.#graph.forEach(async (node) => {
                                if (await fn(node))
                                    result.push(node);
                            }); // nodes.forEach()
                            return result;
                        })();
                        return result;
                    } // value
                } // filter
            }); // Object.defineProperties(this)
            // REM: clean up
            return this; // space
        } // constructor
    } // class Space

    Object.seal(Space);

    return Space;

}; // module.exports :: module.Space

