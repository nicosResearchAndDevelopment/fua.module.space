const
    {createReadStream} = require('fs'),
    {parseStream}      = require('@fua/module.rdf');

/**
 * This is a constructor for the load method, because it still needs other methods.
 * @param {Array<string>} verbose_level
 * @param {number} verbose_mode
 * @param {function} getTopLevel
 * @param {function} tweakPath
 * @param {function} doVerbose
 * @param {function} validation
 * @returns {function}
 */
module.exports = ({
                      verbose_level,
                      verbose_mode,
                      getTopLevel,
                      tweakPath,
                      doVerbose,
                      validation
                  }) => {

    /**
     * The purpose of this function is to automatically load all necessary data into the space.
     * It will be called once from the space, but has recursive calls internally to be able
     * to not only load turtle files, but also a custom file format which includes definitions
     * for distributes contents. The parameters like dataset, shapeset and index are used, to
     * manage data and paths throughout the recursive calls and not load anything twice.
     * @param {Object} context - '@context': used as @context for everything loaded
     * @param {string} id - '@id': used as path to the file, e.g. "file://{resourcePath}resource.universe\\organization\\fraunhofer\\org\\fh.org.ttl"
     * @param {string} type - '@type': used to indicate the file-type, e.g. "text/turtle", "fua/load"
     * @param {string} label - 'rdfs:label': used as alternative to the file path in messages
     * @param {boolean} [dop=true] - 'fua:dop': used to disabled loading, if set to false
     * @param {"none"|"load"|"dop_false"|"all"|"error"|"debug"} [verbose="all"] - 'fua:verbose': used to alter logging complexity
     * @param {Dataset} [dataset] - 'dataset': used to store loaded data in general
     * @param {Dataset} [shapeset] - 'shapeset': used to store loaded data for type "text/sh+turtle"
     * @param {Set<string>} [index] - 'index': used to remember all files, that were already loaded
     * @param {Array<string>} [load_files] - 'fua:load': The files to load additionally. Only used by load-script-definitions
     * @returns {Promise<{hasBeginning: number, startedAt: string, dataset: Dataset, shapeset: Dataset, endedAt: string}>}
     */
    function space_load({
                            '@context':    context,
                            '@id':         id,
                            '@type':       type,
                            'rdfs:label':  label,
                            'fua:dop':     dop = true,
                            'fua:verbose': verbose = 'all', // TODO: "all"
                            'dataset':     dataset = new fua['module']['Dataset'](),
                            'shapeset':    shapeset = new fua['module']['Dataset'](),
                            'index':       index = new Set(),
                            'fua:load':    load_files = []
                        } = {}) {

        return new Promise((load_resolve, load_reject) => {
            try {
                verbose_mode    = ((typeof verbose === 'string') ? verbose_level.indexOf(verbose) : verbose);
                const
                    _top_level_ = getTopLevel()
                ;
                let
                    _file_path,
                    promises    = [],
                    result      = {
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
                        case 'text/turtle':
                            _file_path = tweakPath(id, true);
                            if (!index.has(_file_path)) {

                                doVerbose(verbose_mode, `read '${type}' <${(label || _file_path)}>`);

                                index.add(_file_path);

                                //dataset.loadTTL(_file_path)
                                dataset.addStream(parseStream(createReadStream(_file_path), 'text/turtle', dataset.factory))
                                    .then((loadTTL_result) => {
                                        if (load_files.length > 0) {
                                            load_files.map((load_file) => {

                                                _file_path = tweakPath(load_file['@id']);

                                                if (!index.has(_file_path)) {
                                                    switch (load_file['@type']) {
                                                        case 'application/ld+json':
                                                        case 'text/turtle':
                                                            // TODO: verbose fua.dop === false
                                                            load_file['@context'] = context;
                                                            load_file['verbose']  = verbose;
                                                            load_file['shapeset'] = shapeset;
                                                            load_file['dataset']  = dataset;
                                                            load_file['index']    = index;
                                                            promises.push(space_load(load_file));
                                                            break;
                                                        default:
                                                            doVerbose('error', `error :  file to load has wrong file type <${load_file['@type']}>.`);
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
                                                        doVerbose('error', `error : on validation <${err.toString()}>.`);
                                                        load_reject(err);
                                                    });
                                                } else {
                                                    load_resolve(result);
                                                } // if (_top_level_)
                                            }).catch((err) => {
                                                doVerbose('error', `error : <${err.toString()}>.`);
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
                                        doVerbose('error', `error : on 'loadTTL_err' : <${loadTTL_err.toString()}>`);
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
                                        doVerbose('error', `error : on validation <${err.toString()}>.`);
                                        load_reject(err);
                                    });
                                } else {
                                    load_resolve(result);
                                } // if (_top_level_)
                            } // if ()
                            break; // text/turtle
                        case 'application/ld+json':
                            break; // application/ld+json
                        case 'text/sh+turtle':
                            _file_path = tweakPath(id, true);
                            if (!index.has(_file_path)) {

                                doVerbose(verbose_mode, `read '${type}' <${(label || _file_path)}>`);

                                index.add(_file_path);

                                //shapeset.loadTTL(_file_path)
                                shapeset.addStream(parseStream(createReadStream(_file_path), 'text/turtle', shapeset.factory))
                                    .then((loadTTL_result) => {
                                        if (load_files.length > 0) {
                                            load_files.map((load_file) => {

                                                _file_path = tweakPath(load_file['@id']);

                                                if (!index.has(_file_path)) {
                                                    switch (load_file['@type']) {
                                                        case 'text/sh+turtle':
                                                            // TODO: verbose fua.dop === false
                                                            load_file['@context'] = context;
                                                            load_file['verbose']  = verbose;
                                                            load_file['shapeset'] = shapeset;
                                                            load_file['dataset']  = dataset;
                                                            load_file['index']    = index;
                                                            promises.push(space_load(load_file));
                                                            break;
                                                        default:
                                                            doVerbose('error', `error :  file to load is NOT a shape <${load_file['@type']}> on file <${id}>.`);
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
                                                        doVerbose('error', `error : on validation <${err.toString()}>.`);
                                                        load_reject(err);
                                                    });
                                                } else {
                                                    load_resolve(result);
                                                } // if (_top_level_)
                                            }).catch((err) => {
                                                doVerbose('error', `error : <${err.toString()}>.`);
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
                                        doVerbose('error', `error : on 'loadTTL_err' : <${loadTTL_err.toString()}>`);
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

                        case 'fua/load':

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
                                            case 'text/turtle':
                                                file['@context'] = context;
                                                //REM: !!! loc_resource['fua:dop']  = true;
                                                // TODO: verbose fua.dop === false
                                                file['verbose']  = verbose;
                                                file['shapeset'] = shapeset;
                                                file['dataset']  = dataset;
                                                file['index']    = index;
                                                promises.push(space_load(file));
                                                break; // text/turtle
                                            case 'application/ld+json':
                                                // TODO: application/ld+json
                                                break; // application/ld+json
                                            case 'text/sh+turtle':
                                                file['@context'] = context;
                                                //REM: !!! loc_resource['fua:dop']  = true;
                                                // TODO: verbose fua.dop === false
                                                file['verbose']  = verbose;
                                                file['shapeset'] = shapeset;
                                                file['dataset']  = dataset;
                                                file['index']    = index;
                                                promises.push(space_load(file));
                                                break; // application/ld+json
                                            case 'fua/load':
                                                file['@context'] = context;
                                                //REM: !!! loc_resource['fua:dop']  = true;
                                                // TODO: verbose fua.dop === false
                                                file['verbose']  = verbose;
                                                file['shapeset'] = shapeset;
                                                file['dataset']  = dataset;
                                                file['index']    = index;
                                                promises.push(space_load(file));
                                                break; // application/ld+json
                                            default:
                                                // TODO: what is to do?!?
                                                // TODO: verbose
                                                doVerbose('error', `error : unkown file type <${file['@type']}>.`);
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
                                            doVerbose('error', `error : on validation <${err.toString()}>.`);
                                            load_reject(err);
                                        }); // validation
                                    } else {
                                        load_resolve(result);
                                    } // if (_top_level_)
                                }).catch((err) => {
                                    doVerbose('error', `error : <${err.toString()}>.`);
                                    load_reject(err);
                                }); // Promise.all()
                            } // if ()
                            break; // fua/load
                        default:
                            doVerbose('error', `error : unkown file type <${type}>`);
                            break; // default
                    } // switch(type)
                    //endregion files
                } else {
                    // TODO: verbose
                    doVerbose('dop_false', `warning : 'fua:dop' set to <false> on <${id}>.`);
                    load_resolve(result);
                } // if (dop)
            } catch (jex) {
                // TODO: verbose
                doVerbose('error', `exception <${jex.toString()}>`);
                load_reject(jex);
            }  // try
        }); // rnP
    }

    return space_load;
};