const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

/**
 * @class {_space.Node}
 */
module.exports = class Node extends _.ProtectedEmitter {

    #space;
    #factory;
    #term;

    #loadedData;
    #currentData;
    /** @type {Set<string>} */
    #loadedProps;
    /** @type {boolean} */
    #allPropsLoaded;

    /**
     * @param {Symbol} secret
     * @param {_space.Space} space
     * @param {_persistence.Term} term
     * @protected
     */
    constructor(secret, space, term) {
        _.assert(secret === _.SECRET, 'Node#constructor : protected method');
        _.assert(space instanceof _space.Space, 'Node#constructor : expected space to be a Space', TypeError);
        super();
        this.#space   = space;
        this.#factory = space.getFactory(_.SECRET);
        this.#term    = term;

        this.#loadedData     = null;
        this.#currentData    = new _persistence.Dataset(null, this.#factory);
        this.#loadedProps    = new Set();
        this.#allPropsLoaded = false;
        this.#space._emit(_.SECRET, _.events.node_created, this);
    } // Node#constructor

    /**
     * @param {Symbol} secret
     * @returns {_space.Space}
     * @protected
     */
    getSpace(secret) {
        _.assert(secret === _.SECRET, 'Node#getSpace : protected method');
        return this.#space;
    } // Node#getSpace

    #getPredicate(prop) {
        const term = this.#space.getNodeTerm(prop);
        _.assert(term.termType === 'NamedNode', 'Node##getPredicate : must be a named node');
        return term;
    } // Node##getPredicate

    /** @type {_persistence.Term} */
    get term() {
        return this.#term;
    } // Node#term

    /** @type {string} */
    get id() {
        return this.#factory.termToId(this.#term);
    } // Node#id

    /** @type {string | Array<string>} */
    get type() {
        if (!this.#loadedData) return null;
        const rdf_type = this.#getPredicate('@type');
        const objects  = Array.from(this.#currentData.match(this.term, rdf_type).objects());
        if (objects.length > 1) return objects.map(term => this.#factory.termToId(term));
        if (objects.length === 1) return this.#factory.termToId(objects[0]);
        return null;
    } // Node#type<getter>

    set type(values) {
        this.setNodes(_.iris.rdf_type, values);
    } // Node#type<setter>

    isLoaded(prop) {
        if (this.#allPropsLoaded) return true;
        const predicate = this.#getPredicate(prop);
        return this.#loadedProps.has(predicate.value);
    } // Node#isLoaded

    clear() {
        this.#loadedData  = null;
        this.#currentData = new _persistence.Dataset(null, this.#factory);
        this.#loadedProps.clear();
        this.#allPropsLoaded = false;
        this.#space.uncacheNode(_.SECRET, this);
        this.#space._emit(_.SECRET, _.events.node_cleared, this);
    } // Node#clear

    dataset() {
        return this.#currentData.match(this.#term);
    } // Node#dataset

    /**
     * @param {string} prop
     * @returns {_space.Node | null}
     */
    getNode(prop) {
        _.assert(this.isLoaded(prop), 'Node#getNode : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        if (objects.length !== 1) return null;
        if (!_.isNodeTerm(objects[0])) return null;
        return this.#space.getNode(objects[0]);
    } // Node#getNode

    /**
     * @param {string} prop
     * @param {_space.Node} value
     * @returns {void}
     */
    setNode(prop, value) {
        _.assert(this.isLoaded(prop), 'Node#setNode : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#setNode : can only set a node on a single value property');
        const newObject = this.#space.getNodeTerm(value);
        if (objects.length > 0) {
            _.assert(_.isNodeTerm(objects[0]), 'Node#setNode : can only set a node on a node property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        this.#currentData.add(this.#factory.quad(this.term, predicate, newObject));
    } // Node#setNode

    /**
     * @param {string} prop
     * @returns {void}
     */
    deleteNode(prop) {
        _.assert(this.isLoaded(prop), 'Node#setNode : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#deleteNode : can only delete a node on a single value property');
        if (objects.length > 0) {
            _.assert(_.isNodeTerm(objects[0]), 'Node#deleteNode : can only delete a node on a node property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
    } // Node#deleteNode

    /**
     * @param {string} prop
     * @returns {_space.Literal | null}
     */
    getLiteral(prop) {
        _.assert(this.isLoaded(prop), 'Node#getLiteral : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        if (objects.length !== 1) return null;
        if (!_.isLiteralTerm(objects[0])) return null;
        return this.#space.getLiteral(objects[0]);
    } // Node#getLiteral

    /**
     * @param {string} prop
     * @param {_space.Literal} value
     * @param {string | _space.Node} [option]
     * @returns {void}
     */
    setLiteral(prop, value, option) {
        _.assert(this.isLoaded(prop), 'Node#setLiteral : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#setLiteral : can only set a literal on a single value property');
        const newObject = this.#space.getLiteralTerm(value, option);
        if (objects.length > 0) {
            _.assert(_.isLiteralTerm(objects[0]), 'Node#setLiteral : can only set a literal on a literal property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        this.#currentData.add(this.#factory.quad(this.term, predicate, newObject));
    } // Node#setLiteral

    /**
     * @param {string} prop
     * @returns {void}
     */
    deleteLiteral(prop) {
        _.assert(this.isLoaded(prop), 'Node#deleteLiteral : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#deleteLiteral : can only set a literal on a single value property');
        if (objects.length > 0) {
            _.assert(_.isLiteralTerm(objects[0]), 'Node#deleteLiteral : can only set a literal on a literal property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
    } // Node#deleteLiteral

    /**
     * @param {string} prop
     * @returns {Array<_space.Node>}
     */
    getNodes(prop) {
        _.assert(this.isLoaded(prop), 'Node#getNodes : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        return objects.filter(_.isNodeTerm).map(term => this.#space.getNode(term));
    } // Node#getNodes

    /**
     * @param {string} prop
     * @param {Array<_space.Node>} values
     * @returns {void}
     */
    setNodes(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#setNodes : prop not loaded');
        const predicate = this.#getPredicate(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#setNodes : expected values to be an array', TypeError);
        const objects    = Array.from(this.#currentData.match(this.term, predicate).objects());
        const newObjects = values.map(value => this.#space.getNodeTerm(value));
        if (objects.length > 0) {
            _.assert(objects.every(_.isNodeTerm), 'Node#setNodes : can only set nodes on a node property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        for (let object of newObjects) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, object));
        }
    } // Node#setNodes

    /**
     * @param {string} prop
     * @param {Array<_space.Node>} values
     * @returns {void}
     */
    addNodes(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#addNodes : prop not loaded');
        const predicate = this.#getPredicate(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#addNodes : expected values to be an array', TypeError);
        const objects    = Array.from(this.#currentData.match(this.term, predicate).objects());
        const newObjects = values.map(value => this.#space.getNodeTerm(value));
        if (objects.length > 0) {
            _.assert(objects.every(_.isNodeTerm), 'Node#addNodes : can only add nodes on a node property');
        }
        for (let object of newObjects) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, object));
        }
    } // Node#addNodes

    /**
     * @param {string} prop
     * @param {Array<_space.Node>} [values]
     * @returns {void}
     */
    deleteNodes(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#deleteNodes : prop not loaded');
        const predicate  = this.#getPredicate(prop);
        values           = _.toArray(values);
        const objects    = Array.from(this.#currentData.match(this.term, predicate).objects());
        const oldObjects = values.map(value => this.#space.getNodeTerm(value));
        if (objects.length > 0) {
            _.assert(objects.every(_.isNodeTerm), 'Node#deleteNodes : can only delete nodes on a node property');
            if (oldObjects.length > 0) {
                for (let object of oldObjects) {
                    this.#currentData.deleteMatches(this.term, predicate, object);
                }
            } else {
                this.#currentData.deleteMatches(this.term, predicate);
            }
        }
    } // Node#deleteNodes

    /**
     * @param {string} prop
     * @returns {Array<_space.Literal>}
     */
    getLiterals(prop) {
        _.assert(this.isLoaded(prop), 'Node#getLiterals : prop not loaded');
        const predicate = this.#getPredicate(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        return objects.filter(_.isLiteralTerm).map(term => this.#space.getLiteral(term));
    } // Node#getLiterals

    /**
     * @param {string} prop
     * @param {Array<_space.Literal>} values
     * @returns {void}
     */
    setLiterals(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#setLiterals : prop not loaded');
        const predicate = this.#getPredicate(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#setLiterals : expected values to be an array', TypeError);
        const objects    = Array.from(this.#currentData.match(this.term, predicate).objects());
        const newObjects = values.map(value => this.#space.getLiteralTerm(value));
        if (objects.length > 0) {
            _.assert(objects.every(_.isLiteralTerm), 'Node#setLiterals : can only set literals on a literal property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        for (let object of newObjects) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, object));
        }
    } // Node#setLiterals

    /**
     * @param {string} prop
     * @param {Array<_space.Literal>} values
     * @returns {void}
     */
    addLiterals(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#addLiterals : prop not loaded');
        const predicate = this.#getPredicate(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#addLiterals : expected values to be an array', TypeError);
        const objects    = Array.from(this.#currentData.match(this.term, predicate).objects());
        const newObjects = values.map(value => this.#space.getLiteralTerm(value));
        if (objects.length > 0) {
            _.assert(objects.every(_.isLiteralTerm), 'Node#addLiterals : can only add literals on a literal property');
        }
        for (let object of newObjects) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, object));
        }
    } // Node#addLiterals

    /**
     * @param {string} prop
     * @param {Array<_space.Literal>} [values]
     * @returns {void}
     */
    deleteLiterals(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#deleteLiterals : prop not loaded');
        const predicate  = this.#getPredicate(prop);
        values           = _.toArray(values);
        const objects    = Array.from(this.#currentData.match(this.term, predicate).objects());
        const oldObjects = values.map(value => this.#space.getLiteralTerm(value));
        if (objects.length > 0) {
            _.assert(objects.every(_.isLiteralTerm), 'Node#deleteLiterals : can only delete literals on a literal property');
            if (oldObjects.length > 0) {
                for (let object of oldObjects) {
                    this.#currentData.deleteMatches(this.term, predicate, object);
                }
            } else {
                this.#currentData.deleteMatches(this.term, predicate);
            }
        }
    } // Node#deleteLiterals

    /**
     * @param {Array<string>} [props]
     * @returns {Promise<boolean>}
     */
    async load(props) {
        const store = this.#space.getStore(_.SECRET);
        props       = _.toArray(props);
        if (!this.#loadedData) this.#space.cacheNode(_.SECRET, this);
        if (props.length > 0) {
            const predicates = props.map(prop => this.#getPredicate(prop));
            if (!this.isLoaded('@type')) {
                const rdf_type = this.#getPredicate('@type');
                if (predicates.every(term => !rdf_type.equals(term))) {
                    predicates.push(rdf_type);
                }
            }
            const predicatesData = await Promise.all(predicates.map(async (predicate) => {
                const predicateData = await store.match(this.#term, predicate);
                return predicateData;
            }));
            if (this.#loadedData) {
                predicates.forEach((predicate, index) => {
                    if (this.#allPropsLoaded || this.#loadedProps.has(predicate.value)) {
                        this.#loadedData.deleteMatches(this.#term, predicate);
                        this.#currentData.deleteMatches(this.#term, predicate);
                    }
                    const predicateData = predicatesData[index];
                    this.#loadedData.add(predicateData);
                    this.#currentData.add(predicateData);
                    if (!this.#allPropsLoaded) this.#loadedProps.add(predicate.value);
                });
            } else {
                this.#loadedData  = new _persistence.Dataset(null, this.#factory);
                this.#currentData = new _persistence.Dataset(null, this.#factory);
                predicates.forEach((predicate, index) => {
                    const predicateData = predicatesData[index];
                    this.#loadedData.add(predicateData);
                    this.#currentData.add(predicateData);
                    this.#loadedProps.add(predicate.value);
                });
            }
        } else {
            this.#loadedData  = await store.match(this.#term);
            this.#currentData = this.#loadedData.match(this.#term);
            this.#loadedProps.clear();
            this.#allPropsLoaded = true;
        }
        this.#space._emit(_.SECRET, _.events.node_loaded, this);
        return this.#loadedData.size > 0;
    } // Node#load

    /**
     * @param {Array<string>} [props]
     * @returns {Promise<boolean>}
     */
    async save(props) {
        const store = this.#space.getStore(_.SECRET);
        props       = _.toArray(props);
        let addData, deleteData;
        if (props.length > 0) {
            const predicates = props.map(prop => this.#getPredicate(prop));
            _.assert(this.#allPropsLoaded || predicates.every(predicate => this.#loadedProps.has(predicate.value)), 'Node#save : props not loaded');
            const
                previousData = new _persistence.Dataset(null, this.#factory),
                nextData     = new _persistence.Dataset(null, this.#factory);
            for (let predicate of predicates) {
                previousData.add(this.#loadedData.match(this.#term, predicate));
                nextData.add(this.#currentData.match(this.#term, predicate));
            }
            addData    = nextData.difference(previousData);
            deleteData = previousData.difference(nextData);
        } else {
            addData    = this.#currentData.difference(this.#loadedData);
            deleteData = this.#loadedData.difference(this.#currentData);
        }
        const [addCount, deleteCount] = await Promise.all([
            addData.size > 0 ? store.add(addData) : 0,
            deleteData.size > 0 ? store.delete(deleteData) : 0
        ]);
        if (addCount) this.#loadedData.add(addData);
        if (deleteCount) this.#loadedData.delete(deleteData);
        this.#space._emit(_.SECRET, _.events.node_saved, this);
        return addCount + deleteCount > 0;
    } // Node#save

    async delete() {
        _.assert(false, 'Node#delete : not implemented');
    } // Node#delete

    toJSON() {
        const result   = {'@id': this.id};
        const rdf_type = this.#getPredicate('@type');
        for (let predicate of this.#currentData.match(this.term).predicates()) {
            if (rdf_type.equals(predicate)) {
                const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
                result['@type'] = objects.map(term => this.#factory.termToId(term));
            } else {
                const key     = this.#factory.termToId(predicate);
                const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
                result[key]   = objects.map((term) => {
                    if (_.isLiteralTerm(term)) return this.#space.getLiteral(term).toJSON();
                    return {'@id': this.#factory.termToId(term)};
                });
            }
        }
        return result;
    } // Node#toJSON

}; // Node
