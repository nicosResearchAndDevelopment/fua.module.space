const
    _ = require('./util.js'),
    { createReadStream } = require('fs'),
    { readFile } = require('fs/promises'),
    { join: joinPath, isAbsolute: isAbsPath, dirname: getDirName } = require('path'),
    { Readable } = require('stream'),
    rdfParser = require('rdf-parse').default,
    persistence = require('@nrd/fua.module.persistence'),
    defaults = Object.freeze({
        contentType: 'text/turtle',
        baseIRI: 'https://www.nicos-rd.com.org/fua#'
    });

/**
 * @param {Readable<string>} textStream
 * @param {string} [contentType]
 * @param {string} [baseIRI]
 * @returns {Promise<Dataset>}
 */
async function parseRdfStream(textStream, contentType = defaults.contentType, baseIRI = defaults.baseIRI) {
    return new Promise((resolve, reject) => {
        let
            result = persistence.dataset(),
            running = true;

        rdfParser.parse(textStream, { contentType, baseIRI })
            .on('data', (quadDoc) => {
                if (running) {
                    try {
                        const quad = persistence.fromQuad(quadDoc);
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
 * @param {string} text
 * @param {string} [contentType]
 * @param {string} [baseIRI]
 * @returns {Promise<Dataset>}
 */
async function parseRdfDoc(text, contentType = defaults.contentType, baseIRI = defaults.baseIRI) {
    const textStream = Readable.from(text.split('\n'));
    return parseRdfStream(textStream, contentType, baseIRI);
} // parseRdfDoc

/**
 * @param {string} filePath
 * @param {string} [contentType]
 * @param {string} [baseIRI]
 * @returns {Promise<Dataset>}
 */
async function parseRdfFile(filePath, contentType = defaults.contentType, baseIRI = defaults.baseIRI) {
    const readStream = createReadStream(filePath);
    return parseRdfStream(readStream, contentType, baseIRI);
} // parseRdfFile

/**
 * TODO
 * @param {Object} param
 * @returns {Promise<Array<Object>>}
 */
async function loadSpace(param) {

    const
        requiredFiles = new Map(),
        loadedFiles = new Map();

    // REM: crappy solution with required and loaded files

    await (async function loader(
        {
            'dct:identifier': identifier = '',
            'dct:title': title = '',
            'dct:alternative': alternative = '',
            'dct:format': format = '',
            'dct:requires': requires = []
        }) {

        _.assert(isAbsPath(identifier), 'loader : not an absolute dct:identifier');
        if (loadedFiles.has(identifier)) return;

        let result = requiredFiles.get(identifier);
        if (result) {
            requiredFiles.delete(identifier);
            if (!result.title) result.title = title;
            if (!result.title) result.alternative = alternative;
            loadedFiles.set(identifier, result);
        } else {
            result = {
                identifier, format,
                title, alternative
            };
            requiredFiles.set(identifier, result);
        }

        await Promise.all(requires.map(loader));

        switch (format) {

            case 'application/n-quads':
            case 'application/trig':
            case 'application/ld+json':
            case 'application/n-triples':
            case 'text/turtle':
            case 'application/rdf+xml':
                result.dataset = await parseRdfFile(identifier, format);
                break;

            case 'application/fua.module.space+json':
                await loader(JSON.parse(
                    await readFile(identifier),
                    (key, value) => (key === 'dct:identifier' && !isAbsPath(value))
                        ? joinPath(getDirName(identifier), value)
                        : value
                ));
                break;

            case 'application/fua.module.space+js':
                // case 'application/fua.module.space+json':
                await loader(JSON.parse(
                    JSON.stringify(require(identifier)),
                    (key, value) => (key === 'dct:identifier' && !isAbsPath(value))
                        ? joinPath(getDirName(identifier), value)
                        : value
                ));
                break;

        } // switch format

    })(param); // loader: recursive async-iife

    return [
        ...loadedFiles.values(),
        ...requiredFiles.values()
    ];

} // loadSpace

module.exports = loadSpace;