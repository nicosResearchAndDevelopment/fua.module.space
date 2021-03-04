const
    _         = require('./module.space.util.js'),
    {Dataset} = require('@nrd/fua.module.persistence');

class Literal {

    constructor(value, language, datatype) {
        this['@value'] = value;
        if (language) this['@language'] = language;
        else this['@type'] = datatype;
    } // Resource#constructor

} // Literal

/**
 * Assigns all quads in a dataset as properties to the given resource.
 * @param {Resource} resource - a preferably empty resource
 * @param {Dataset} dataset - this is supposed to only contains quads with the resource as subject
 * @private
 */
function _assignDataset(resource, dataset) {
    const
        factory  = resource.space.factory,
        rdf_type = factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    for (let {predicate, object} of dataset) {
        const
            key  = predicate.value,
            prop = resource[key] || (resource[key] = []);

        switch (object.termType) {
            case 'NamedNode':
                prop.push(resource.space.getNode(object.value));
                break;
            case 'BlankNode':
                prop.push(resource.space.getNode('_:' + object.value));
                break;
            case 'Literal':
                prop.push(new Literal(object.value, object.language, object.datatype.value));
                break;
        } // switch
    }

    resource['@type'] = (resource[rdf_type.value] || []).map(node => node['@id']);
} // _assignDataset

/**
 * Returns all properties of a given resource as dataset.
 * @param {Resource} resource
 * @returns {Dataset}
 * @private
 */
function _extractDataset(resource) {
    const
        factory = resource.space.factory,
        subject = resource['@id'].startsWith('_:')
            ? factory.blankNode(resource['@id'].substr(2))
            : factory.namedNode(resource['@id']),
        dataset = new Dataset(null, factory);

    for (let key in resource) {
        if (resource.hasOwnProperty(key) && key !== '@id' && key !== '@type') {
            const predicate = factory.namedNode(key);
            for (let node of resource[key]) {
                const object = node['@id']
                    ? node['@id'].startsWith('_:')
                        ? factory.blankNode(node['@id'].substr(2))
                        : factory.namedNode(node['@id'])
                    : factory.literal(
                        node['@value'],
                        node['@language'] || factory.namedNode(node['@type'])
                    );
                dataset.add(factory.quad(subject, predicate, object));
            }
        }
    }

    return dataset;
} // _extractDataset

class Resource {

    /**
     * This constructor is not meant to be published to other modules.
     * As this class performs no validation, it should only be called by the space itself.
     * @param {import("./module.space.js")} space
     * @param {string} id
     */
    constructor(space, id) {
        this.space  = space;
        this['@id'] = id;
        _.hideProp(this, 'space');
        _.lockProp(this, 'space', '@id');
    } // Resource#constructor

    clear() {
        for (let key in this) {
            if (this.hasOwnProperty(key)
                && Reflect.getOwnPropertyDescriptor(this, key).configurable) {
                delete this[key];
            }
        }
    } // Resource#clear

    async create() {
        /** @type {NamedNode} */
        const subject = this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const subjData = _extractDataset(this);
        // cancel create and return false, if the resource does not contain any data
        if (subjData.size === 0) return false;

        /** @type {Dataset} */
        const localSubjData = this.space.localData.match(subject);
        // cancel create and return false, if the resource already exists locally
        if (localSubjData.size > 0) return false;

        /** @type {Dataset} */
        const storeSubjData = await this.space.dataStore.match(subject);
        // cancel create and return false, if the resource already exists in the store
        if (storeSubjData.size > 0) return false;

        /** @type {number} */
        const added = await (subjData.size > 0 ? this.space.dataStore.add(subjData) : 0);
        // return true, if anything actually got added
        return added > 0;
    } // Resource#create

    async read() {
        /** @type {NamedNode} */
        const subject = this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const localSubjData = this.space.localData.match(subject);
        // assign local data to the resource, if it existed (clear first)
        if (localSubjData.size > 0) {
            this.clear();
            _assignDataset(this, localSubjData);
            return localSubjData;
        }

        /** @type {Dataset} */
        const storeSubjData = await this.space.dataStore.match(subject);
        // assign data from store to the resource, if it existed (clear first)
        if (storeSubjData.size > 0) {
            this.clear();
            _assignDataset(this, storeSubjData);
            return storeSubjData;
        }

        // return false, if no data existed
        return false;
    } // Resource#read

    async update() {
        /** @type {NamedNode} */
        const subject = this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const subjData = _extractDataset(this);
        // cancel update and return false, if the resource does not contain any data (would delete the resource)
        if (subjData.size === 0) return false;

        /** @type {Dataset} */
        const localSubjData = this.space.localData.match(subject);
        // cancel update and return false, if the resource already exists locally (no local updated)
        if (localSubjData.size > 0) return false;

        /** @type {Dataset} */
        const storeSubjData = await this.space.dataStore.match(subject);
        // cancel update and return false, if the resource does not exist in the store
        if (storeSubjData.size === 0) return false;

        const
            addData          = subjData.difference(storeSubjData),
            deleteData       = storeSubjData.difference(subjData),
            [added, deleted] = await Promise.all([
                addData.size > 0 ? this.space.dataStore.add(addData) : 0,
                deleteData.size > 0 ? this.space.dataStore.delete(deleteData) : 0
            ]);

        // return true if any data got updated
        return added > 0 || deleted > 0;
    } // Resource#update

    async delete() {
        /** @type {NamedNode} */
        const subject = this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const localSubjData = this.space.localData.match(subject);
        // cancel delete and return false, if the resource exists locally (no local deletes)
        if (localSubjData.size > 0) return false;

        /** @type {Dataset} */
        const storeSubjData = await this.space.dataStore.match(subject);
        // cancel delete and return false, if the resource does not exist in the store
        if (storeSubjData.size === 0) return false;

        const deleted = await this.space.dataStore.delete(storeSubjData);
        if (deleted === 0) return false;

        // clear the resource and return true, if anything got deleted
        this.clear();
        return true;
    } // Resource#delete

} // Resource

module.exports = Resource;