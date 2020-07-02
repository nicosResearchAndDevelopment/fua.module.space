module.exports = ({
                      'hrt':    hrt = () => (new Date).valueOf() / 1000,
                      'config': config
                  }) => {

    const
        persistances                = [
            function (key) {
                return new Promise((resolve, reject) => {
                    try {
                        let result = [];
                        resolve(result);
                    } catch (jex) {
                        reject(jex);
                    } // try
                }); // return P
            } // fn (key
        ] // persistances
        ,
        persistance_request_timeout =
            function (key) {
                return new Promise((resolve, reject) => {
                    setTimeout(function () {
                        /** TODO:config */ reject(`timeout <3000> reached`);
                    }, /** TODO:config */ 3000);
                }); // return P
            } // fn (key
    ; // const

    //region fn

    //function set_(map, resource, agent_persistence) {
    //    if (!resource || (!resource['@id'] && !resource['id']) || map.get(resource['@id']))
    //        throw new Error(`Space : set : WRONG node`); // TODO:
    //    return map['set']((resource['@id'] || resource['id']), resource);
    //} // function set_()

    function set_(map, resource, agent_persistence) {
        if (!resource || (!resource['@id'] && !resource['id']) || map.get(resource['@id']))
            throw new Error(`Space : set : WRONG node`); // TODO:
        if (agent_persistence)
            return agent_persistence['MERGE']();
        return new Promise(() => map['set']((resource['@id'] || resource['id']), resource));
    } // function set_()
    //endregion fn

    class Space {

        #context           = null; // !!!
        #root              = "";
        #map;
        #agent_persistence = null;

        constructor(
            {
                '@context':          context = null, // !!!
                'root':              root = "",
                'resources':         resources = [],
                'agent_persistence': agent_persistence = null // !!!
            } =
                {
                    'root':      "",
                    'resources': []
                }) {
            this.#context           = context;
            this.#root              = root;
            this.#map               = new Map();
            this.#agent_persistence = agent_persistence;

            if (resources && (resources['length'] > 0)) {
                resources.forEach((resource) => {
                    return set_(this.#map, resource);
                });
            } // if ()
            // REM: clean up
            resources = undefined;
        } // constructor

        get context() {
            return this.#context;
        }

        set context(context) {
            if (this.#context === null)
                this.#context = context
        }

        addContext(prefix, context) {
            if (this.#context === null)
                this.#context = context
        }

        spread(id) {
            let
                splitter = id.split(":"),
                result   = {}
            ;
            if (this.#context === null) {
                result['id'] = id;
                return result;
            } else {
                if (this.#context[splitter[0]]) {
                    result['id']      = id;
                    result['@prefix'] = splitter[0];
                    result['tail']    = splitter[1];
                    result['uri']     = `${this.#context[splitter[0]]}${result['tail']}`;
                } // if ()
            } // if ()
            return result;
        } // spread

        set(resource, persistence = false) {
            //if (!resource || (!resource['@id'] && !resource['id']) || this.#map.get(resource['@id']))
            //    throw new Error();
            //return this.#map.set((resource['@id'] || resource['id']), resource);
            return set_(this.#map, resource, ((persistence) ? this.#agent_persistence : null));
        }

        has(key) {
            //TODO: mixed mode key = string || object
            return this.#map.has(key);
        }

        /**
         * result: { node | undefined } or { [n] | [] }
         * @param keys
         * @returns {*[]}
         */
        get(keys) {
            let
                //keys_is_array = Array.isArray(keys),
                result,
                node
            ;
            //keys = ((keys_is_array) ? keys : [keys]);
            if (Array.isArray(keys)) {
                //kind = ((keys.length > 0) ? (typeof keys[0]) : undefined);
                result = []; // REM: user expects array of nodes
                switch (((keys.length > 0) ? (typeof keys[0]) : undefined)) {
                    case "string":
                        keys.forEach((value, index, array) => {
                            node = this.#map.get(value);
                            if (node) {
                                result.push(node);
                            } else {
                                if (persistances && (persistances.length > 0))
                                    Promise.race(persistances.concat([persistance_request_timeout]).map((pers) => pers(key))).then((race_result) => {

                                    }).catch((err) => {

                                    });
                            } // if ()
                        }); // keys.forEach()
                        break;
                    case "object":
                        keys.forEach((value, index, array) => {
                            node = this.#map.get(value['@id']);
                            if (node)
                                result.push(node);
                        }); // keys.forEach()
                        break;
                    default:
                        result = [];
                        break; // default
                } // switch(((keys.length > 0) ? (typeof keys[0]) : undefined))

            } else {
                // REM: user expects node
                result = this.#map.get(((typeof keys === "string") ? keys : keys['@id']));
            } // if ()
            return result;
        } // get(key)

        //TODO: filter
        filter(expression) {
            return new Promise((resolve, result) => {
                try {
                    let result   = {
                        '@graph': []
                    };
                    result['ts'] =
                        resolve(result);
                } catch (jex) {
                    reject(jex);
                } // try
            }); // return P
        } // filter(expression)

        //get ids() {
        //    return [...this.#map.keys()];
        //}

        get map() {
            return this.#map;
        }

        get keys() {
            return [...this.#map.keys()];
        }

        get nodes() {
            return [...this.#map.values()];
        }

    } // class Space

    Object.seal(Space);

    return ((config) ? new Space(config) : Space);

}; // module.exports :: module.Space

