module.exports = () => {

    const
        fua  = global['fua'],
        hrt  = fua['core']['hrt'],
        uuid = fua['core']['uuid']
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

    //endregion fn

    class Space {

        #IM        = null;
        #context   = null; // !!!
        #root      = "";
        #weaktypes = new WeakMap();
        #weaknodes = new WeakMap();
        #graph     = new Map();

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

