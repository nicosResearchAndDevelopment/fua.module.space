const
    _         = require('./module.space.util.js'),
    {Dataset} = require('@nrd/fua.module.persistence');

class Resource {

    /**
     * This constructor is not meant to be published to other modules, it should only be called by the space itself.
     * @param {import("./module.space.js")} space
     * @param {string} id
     */
    constructor(space, id) {
        this.space  = space;
        this['@id'] = id;
        _.hideProp(this, 'space');
        _.lockProp(this, 'space', '@id');
    } // Resource#constructor

    toJSON() {
        const result = {};
        for (let [key, value] of Object.entries(this)) {
            if (_.isArray(value)) {
                result[key] = value.map(res => res?.['@id'] ? {'@id': res['@id']} : res);
            } else {
                result[key] = value;
            }
        }
        return result;
    } // Resource#toJSON

    /**
     * Deleted all enumerable and non configurable properties of a resource.
     * @returns {Resource} this
     */
    clear() {
        for (let key in this) {
            if (this.hasOwnProperty(key)
                && Reflect.getOwnPropertyDescriptor(this, key).configurable) {
                delete this[key];
            }
        }
        return this;
    } // Resource#clear

    /**
     * Assigns all matching quads in a dataset as properties to the given resource.
     * @param {Dataset} data
     * @returns {Resource} this
     */
    assign(data) {
        _.assert(data instanceof Dataset, 'Resource#assign : invalid data', TypeError);

        const
            factory  = this.space.factory,
            rdf_type = factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

        for (let {subject, predicate, object} of data) {
            switch (subject.termType) {
                case 'NamedNode':
                    if (this['@id'] !== subject.value)
                        continue;
                    break;
                case 'BlankNode':
                    if (this['@id'] !== '_:' + subject.value)
                        continue;
                    break;
                default:
                    continue;
            }

            const
                key  = predicate.value,
                prop = this[key] || (this[key] = []);

            switch (object.termType) {
                case 'NamedNode':
                    prop.push(this.space.getNode(object.value));
                    break;
                case 'BlankNode':
                    prop.push(this.space.getNode('_:' + object.value));
                    break;
                case 'Literal':
                    prop.push(object.language ? {
                        '@value':    object.value,
                        '@language': object.language
                    } : {
                        '@value': object.value,
                        '@type':  object.datatype.value
                    });
                    break;
            } // switch
        }

        this['@type'] = (this[rdf_type.value] || []).map(node => node['@id']);
        return this;
    } // Resource#assign

    /**
     * Returns all properties of a given resource as dataset.
     * @returns {Dataset}
     */
    extract() {
        const
            factory = this.space.factory,
            subject = this['@id'].startsWith('_:')
                ? factory.blankNode(this['@id'].substr(2))
                : factory.namedNode(this['@id']),
            dataset = new Dataset(null, factory);

        for (let key in this) {
            if (this.hasOwnProperty(key) && key !== '@id' && key !== '@type') {
                const predicate = factory.namedNode(key);
                _.assert(_.isIterable(this[key]), 'Resource<' + this['@id'] + '>.extract : "' + key + '" is not iterable');
                for (let node of this[key]) {
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
    } // Resource#extract

    /**
     * Extracts the data from this resource and tries to create it in the store, if not already present.
     * @returns {Promise<boolean>}
     */
    async create() {
        /** @type {NamedNode} */
        const subject = this['@id'].startsWith('_:')
            ? this.space.factory.blankNode(this['@id'].substr(2))
            : this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const subjData = this.extract();
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

    /**
     * Reads the data from the store and assigns it to this resource, clearing it first.
     * @returns {Promise<Dataset|boolean>}
     */
    async read() {
        /** @type {NamedNode} */
        const subject = this['@id'].startsWith('_:')
            ? this.space.factory.blankNode(this['@id'].substr(2))
            : this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const localSubjData = this.space.localData.match(subject);
        // assign local data to the resource, if it existed (clear first)
        if (localSubjData.size > 0) {
            this.clear().assign(localSubjData);
            return localSubjData;
        }

        /** @type {Dataset} */
        const storeSubjData = await this.space.dataStore.match(subject);
        // assign data from store to the resource, if it existed (clear first)
        if (storeSubjData.size > 0) {
            this.clear().assign(storeSubjData);
            return storeSubjData;
        }

        // return false, if no data existed
        return false;
    } // Resource#read

    /**
     * Extracts the data from this resource and updates the difference in the store, if not missing.
     * @returns {Promise<boolean>}
     */
    async update() {
        /** @type {NamedNode} */
        const subject = this['@id'].startsWith('_:')
            ? this.space.factory.blankNode(this['@id'].substr(2))
            : this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const subjData = this.extract();
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

    /**
     * Gathers all data of this resource from the store and deletes it afterwards.
     * @returns {Promise<boolean>}
     */
    async delete() {
        /** @type {NamedNode} */
        const subject = this['@id'].startsWith('_:')
            ? this.space.factory.blankNode(this['@id'].substr(2))
            : this.space.factory.namedNode(this['@id']);

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

    /**
     * Gathers all references to this resource from the store and removes them afterwards.
     * @returns {Promise<boolean>}
     */
    async unlink() {
        /** @type {NamedNode} */
        const object = this['@id'].startsWith('_:')
            ? this.space.factory.blankNode(this['@id'].substr(2))
            : this.space.factory.namedNode(this['@id']);

        /** @type {Dataset} */
        const localObjData = this.space.localData.match(null, null, object);
        // cancel unlink and return false, if the resource is referenced locally (no local unlinks)
        if (localObjData.size > 0) return false;

        /** @type {Dataset} */
        const storeObjData = await this.space.dataStore.match(null, null, object);
        // cancel unlink and return false, if the resource is not referenced in the store
        if (storeObjData.size === 0) return false;

        const deleted = await this.space.dataStore.delete(storeObjData);
        if (deleted === 0) return false;

        // return true, if anything got deleted
        return true;
    } // Resource#unlink

} // Resource

module.exports = Resource;