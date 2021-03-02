const
    _         = require('./module.space.util.js'),
    {Dataset} = require('@nrd/fua.module.persistence');

/**
 * Assigns all quads in a dataset as properties to the given resource.
 * @param {Resource} resource - a preferably empty resource
 * @param {Dataset} dataset - this is supposed to only contains quads with the resource as subject
 * @private
 */
function _assignDataset(resource, dataset) {
    const
        factory = resource.space.factory;

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

    const rdf_type    = factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
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

class Literal {

    constructor(value, language, datatype) {
        this['@value'] = value;
        if (language) this['@language'] = language;
        else this['@type'] = datatype;
    } // Resource#constructor

} // Literal

class Resource {

    constructor(space, id) {
        this.space  = space;
        this['@id'] = id;
        _.hideProp(this, 'space');
        _.lockProp(this, 'space', '@id');
    } // Resource#constructor

    clear() {
        for (let key in this) {
            if (this.hasOwnProperty(key) && key !== '@id') {
                delete this[key];
            }
        }
    } // Resource#clear

    async create() {
        //if (await Model.prototype.create.call(this)) {
        //    return true;
        //}

        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = await this.space.store.match(subject);

        if (nodeData.size > 0) {
            return false;
        } else {
            const
                addData = _extractDataset(this),
                added   = addData.size > 0 ? await this.space.store.add(addData) : 0;
            return !!added;
        }
    } // Resource#create

    async read() {
        //if (await Model.prototype.read.call(this)) {
        //    return true;
        //}

        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = await this.space.store.match(subject);

        if (nodeData.size > 0) {
            if (this['@type']) this.clear();
            _assignDataset(this, nodeData);
            return true;
        } else {
            return false;
        }
    } // Resource#read

    async update() {
        //if (await Model.prototype.update.call(this)) {
        //    return true;
        //}

        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = await this.space.store.match(subject);

        if (nodeData.size > 0) {
            const
                currData         = _extractDataset(this),
                addData          = currData.difference(nodeData),
                deleteData       = nodeData.difference(currData),
                [added, deleted] = await Promise.all([
                    addData.size > 0 ? this.space.store.add(addData) : 0,
                    deleteData.size > 0 ? this.space.store.delete(deleteData) : 0
                ]);

            return !!added || !!deleted;
        } else {
            return false;
        }
    } // Resource#update

    async delete() {
        //if (await Model.prototype.delete.call(this)) {
        //    return true;
        //}

        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = await this.space.store.match(subject);

        if (nodeData.size > 0) {
            const deleted = await this.space.store.delete(nodeData);
            return !!deleted;
        } else {
            return false;
        }
    } // Resource#delete

} // Resource

class Model extends Resource {

    constructor(space, id, builder) {
        super(space, id);
        this.build = builder;
        _.hideProp(this, 'build');
        _.lockProp(this, 'build');
    } // Resource#constructor

    async create() {
        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = this.space.data.match(subject);

        if (nodeData.size > 0) {
            return false;
        } else {
            const
                addData = _extractDataset(this),
                added   = addData.size > 0 ? this.space.data.add(addData) : 0;
            return !!added;
        }
    } // Model#create

    async read() {
        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = this.space.data.match(subject);

        if (nodeData.size > 0) {
            if (this['@type']) this.clear();
            _assignDataset(this, nodeData);
            return true;
        } else {
            return false;
        }
    } // Model#read

    async update() {
        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = this.space.data.match(subject);

        if (nodeData.size > 0) {
            const
                currData         = _extractDataset(this),
                addData          = currData.difference(nodeData),
                deleteData       = nodeData.difference(currData),
                [added, deleted] = [
                    addData.size > 0 ? this.space.data.add(addData) : 0,
                    deleteData.size > 0 ? this.space.data.delete(deleteData) : 0
                ];

            return !!added || !!deleted;
        } else {
            return false;
        }
    } // Model#update

    async delete() {
        const
            subject  = this.space.factory.namedNode(this['@id']),
            /** @type {Dataset} */
            nodeData = this.space.data.match(subject);

        if (nodeData.size > 0) {
            const deleted = this.space.data.delete(nodeData);
            return !!deleted;
        } else {
            return false;
        }
    } // Model#delete

} // Model

module.exports = {
    Literal, Resource, Model
};