const
    { createReadStream } = require('fs'),
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
 * @param {Object} config
 * @returns {Promise<void>}
 */
async function loadSpace(config) {

    // TODO

} // loadSpace

module.exports = loadSpace;