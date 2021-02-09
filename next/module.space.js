const
    _ = require('./util.js'),
    persistence = require('@nrd/fua.module.persistence'),
    loadSpace = require('./module.space.load.js'),
    _isPrefix = _.strValidator(/^\w+$/),
    _isIRI = _.strValidator(/^\w+:\S+$/);

class Space {

    #prefixes = new Map();
    #dataset = persistence.dataset();

    constructor(options) {

        if (options.prefixes) {
            for (let [prefix, iri] of Object.entries(options.prefixes)) {
                _.assert(_isPrefix(prefix), 'Space#constructor : invalid prefix', TypeError);
                _.assert(_isIRI(iri), 'Space#constructor : invalid iri', TypeError);

                const
                    localReplacer = (str) => str.startsWith(iri)
                        ? prefix + ':' + str.substr(iri.length) : str,
                    globalReplacer = ((regex) =>
                            (str) => str.replace(regex, prefix + ':')
                    )(_.strToRegex(iri, 'g'));

                this.#prefixes.set(prefix, {
                    prefix, iri,
                    localReplacer,
                    globalReplacer
                });
            } // for each entry
        } // if options.prefixes

    } // Space#constructor

    async load(param) {
        const resultArr = await loadSpace(param);
        for (let result of resultArr) {
            if (result.dataset)
                this.#dataset.add(result.dataset);
        }
    } // Space#constructor

} // Space

module.exports = Space;