const
    _                  = require('./module.space.util.js'),
    {createReadStream} = require('fs'),
    {readFile}         = require('fs/promises'),
    {
        join:    joinPath, isAbsolute: isAbsPath,
        dirname: getDirName, basename: getFileName, extname: getExtName
    }                  = require('path'),
    rdfParser          = require('rdf-parse').default,
    {Dataset}          = require('@nrd/fua.module.persistence'),
    _baseIRI           = 'https://www.nicos-rd.com.org/fua#',
    _formats           = Object.freeze({
        // load scripts
        spaceJson: 'application/fua.module.space+json',
        spaceJs:   'application/fua.module.space+js',
        // regular
        nQuads:   'application/n-quads',
        triG:     'application/trig',
        jsonLD:   'application/ld+json',
        nTriples: 'application/n-triples',
        turtle:   'text/turtle',
        rdfXml:   'text/rdf+xml'
    }),
    _fields            = Object.freeze({
        identifier:  'dct:identifier',
        title:       'dct:title',
        alternative: 'dct:alternative',
        format:      'dct:format',
        requires:    'dct:requires'
    });

/**
 * @param {Readable<string>} textStream
 * @param {string} contentType
 * @param {string} [baseIRI]
 * @returns {Promise<Dataset>}
 */
async function parseRdfStream(textStream, contentType, baseIRI = _baseIRI) {
    return new Promise((resolve, reject) => {
        let
            result  = new Dataset(),
            running = true;

        rdfParser.parse(textStream, {contentType, baseIRI})
            .on('data', (quadDoc) => {
                if (running) {
                    try {
                        const quad = result.factory.fromQuad(quadDoc);
                        result.add(quad);
                    } catch (err) {
                        running = false;
                        reject(err);
                    }
                }
            })
            .on('error', (err) => {
                if (running) {
                    running = false;
                    reject(err);
                }
            })
            .on('end', () => {
                if (running) {
                    running = false;
                    resolve(result);
                }
            });
    });
} // parseRdfStream

/**
 * @param {string} filePath
 * @param {string} contentType
 * @param {string} [baseIRI]
 * @returns {Promise<Dataset>}
 */
async function parseRdfFile(filePath, contentType, baseIRI = _baseIRI) {
    // const text = (await readFile(filePath)).toString();
    // return parseRdfDoc(text, contentType, baseIRI);
    const readStream = createReadStream(filePath);
    return parseRdfStream(readStream, contentType, baseIRI);
} // parseRdfFile

/**
 * @param {Map<string, Object>} loaded
 * @param {Object} param
 * @returns {Promise<string>}
 */
async function loadRegular(loaded, {
    [_fields.identifier]:  identifier = '',
    [_fields.title]:       title = '',
    [_fields.alternative]: alternative = '',
    [_fields.format]:      format = '',
    [_fields.requires]:    requires = []
}) {
    _.assert(_.isString(identifier) && isAbsPath(identifier), `load : ${_fields.identifier} must be an absolute path`);
    title = title || getFileName(identifier, getExtName(identifier));

    if (loaded.has(identifier)) return loaded.get(identifier);
    const result = {identifier, title, alternative, format};
    loaded.set(identifier, result);

    // result.dataset = await parseRdfFile(identifier, format);
    // result.requires = await loadRequirements(loaded, ...requires);
    [
        result.dataset,
        result.requires
    ] = await Promise.all([
        parseRdfFile(identifier, format),
        loadRequirements(loaded, ...requires)
    ]);

    return identifier;
} // loadRegular

/**
 * @param {Map<string, Object>} loaded
 * @param {Object} param
 * @returns {Promise<string>}
 */
async function loadReference(loaded, {
    [_fields.identifier]: filePath,
    [_fields.format]:     fileType
}) {
    _.assert(_.isString(filePath) && isAbsPath(filePath), `load : ${_fields.identifier} must be an absolute path`);
    _.assert(fileType === _formats.spaceJs || fileType === _formats.spaceJson, `load : invalid ${_fields.format}`);

    let
        fileContent = (fileType === _formats.spaceJs)
            ? JSON.stringify(require(filePath))
            : (await readFile(filePath)).toString().replace(/^\s*\/\/.*$/mg, ''),
        param       = JSON.parse(fileContent, (key, value) => {
            if (key === _fields.identifier && !isAbsPath(value))
                return joinPath(getDirName(filePath), value);
            else return value;
        }),
        {
            [_fields.identifier]:  identifier  = filePath,
            [_fields.title]:       title       = '',
            [_fields.alternative]: alternative = '',
            [_fields.format]:      format      = fileType,
            [_fields.requires]:    requires    = []
        }           = param;

    _.assert(identifier === filePath, `load : expected ${_fields.identifier} not be ${filePath}`);
    _.assert(format === fileType, `load : expected ${_fields.format} to be ${fileType}`);
    title = title || getFileName(identifier, getExtName(identifier));

    if (loaded.has(identifier)) return loaded.get(identifier);
    const result = {identifier, title, alternative, format};
    loaded.set(identifier, result);

    result.requires = await loadRequirements(loaded, ...requires);

    return identifier;
} // loadReference

/**
 * @param {Map<string, Object>} loaded
 * @param {...Object} requires
 * @returns {Promise<Array>}
 */
async function loadRequirements(loaded, ...requires) {
    return Promise.all(requires.map(async (param) => {
        _.assert(_.isObject(param), `load : invalid param`, TypeError);
        switch (param[_fields.format]) {
            case _formats.nQuads:
            case _formats.triG:
            case _formats.jsonLD:
            case _formats.nTriples:
            case _formats.turtle:
            case _formats.rdfXml:
                return loadRegular(loaded, param);

            case _formats.spaceJson:
            case _formats.spaceJs:
                return loadReference(loaded, param);

            default:
                _.assert(false, `load : unknown ${_fields.format} ${param[_fields.format]}`);
        } // switch
    }));
} // loadRequirements

/**
 * @param {Object} param
 * @returns {Promise<Array<Object>>}
 */
module.exports = async function (param) {
    const loaded = new Map();
    await loadRequirements(loaded, param);
    return Array.from(loaded.values());
}; // exports