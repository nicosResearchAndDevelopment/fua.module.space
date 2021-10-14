const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Node extends _.ProtectedEmitter {

    /** @type {import('./module.space.js').Space} */
    #space;
    /** @type {import('@nrd/fua.module.persistence').DataFactory} */
    #factory;
    #term;

    #loadedData;
    #currentData;
    /** @type {Set<string>} */
    #loadedProps;
    /** @type {boolean} */
    #allPropsLoaded;

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
    } // Node#constructor

    getSpace(secret) {
        _.assert(secret === _.SECRET, 'Node#getSpace : protected method');
        return this.#space;
    } // Node#getSpace

    #termToOptionalNode(term) {
        if (term.termType === 'NamedNode') return this.#space.getNode(term);
        if (term.termType === 'BlankNode') return this.#space.getNode(term);
    } // Node##termToOptionalNode

    #termToOptionalLiteral(term) {
        if (term.termType === 'Literal') return this.#space.getLiteral(term);
    } // Node##termToOptionalLiteral

    get id() {
        return this.#factory.termToId(this.#term);
    } // Node#id

    get type() {
        if (!this.#loadedData) return null;
        const rdf_type = this.#factory.namedNode(_.iris.rdf_type);
        const objects  = Array.from(this.#currentData.match(this.term, rdf_type).objects());
        if (objects.length > 1) return objects.map(term => this.#factory.termToId(term));
        if (objects.length === 1) return this.#factory.termToId(objects[0]);
        return null;
    } // Node#type

    set type(values) {
        this.setNodes(_.iris.rdf_type, values);
    } // Node#type

    get term() {
        return this.#term;
    } // Node#term

    isLoaded(prop) {
        if (this.#allPropsLoaded) return true;
        const predicate = this.#factory.namedNode(prop);
        return this.#loadedProps.has(predicate.value);
    } // Node#isLoaded

    /**
     * @param {string} prop
     * @returns {_space.Node | null}
     */
    getNode(prop) {
        _.assert(this.isLoaded(prop), 'Node#getNode : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        if (objects.length !== 1) return null;
        return this.#termToOptionalNode(objects[0]) || null;
    } // Node#getNode

    /**
     * @param {string} prop
     * @param {_space.Node} value
     * @returns {_space.Node}
     */
    setNode(prop, value) {
        _.assert(this.isLoaded(prop), 'Node#setNode : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#setNode : can only set a node on a single value property');
        const node = this.#space.getNode(value);
        if (objects.length > 0) {
            const previousNode = this.#termToOptionalNode(objects[0]);
            _.assert(previousNode, 'Node#setNode : can only set a node on a node property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        this.#currentData.add(this.#factory.quad(this.term, predicate, node.term));
        return node;
    } // Node#setNode

    /**
     * @param {string} prop
     * @returns {void}
     */
    deleteNode(prop) {
        _.assert(this.isLoaded(prop), 'Node#setNode : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#deleteNode : can only delete a node on a single value property');
        if (objects.length > 0) {
            const previousNode = this.#termToOptionalNode(objects[0]);
            _.assert(previousNode, 'Node#deleteNode : can only delete a node on a node property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
    } // Node#deleteNode

    /**
     * @param {string} prop
     * @returns {_space.Literal | null}
     */
    getLiteral(prop) {
        _.assert(this.isLoaded(prop), 'Node#getLiteral : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        if (objects.length !== 1) return null;
        return this.#termToOptionalLiteral(objects[0]) || null;
    } // Node#getLiteral

    /**
     * @param {string} prop
     * @param {_space.Literal} value
     * @param {string | _space.Node} [option]
     * @returns {_space.Literal}
     */
    setLiteral(prop, value, option) {
        _.assert(this.isLoaded(prop), 'Node#setLiteral : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#setLiteral : can only set a literal on a single value property');
        const literal = this.#space.getLiteral(value, option);
        if (objects.length > 0) {
            const previousLiteral = this.#termToOptionalLiteral(objects[0]);
            _.assert(previousLiteral, 'Node#setLiteral : can only set a literal on a literal property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        this.#currentData.add(this.#factory.quad(this.term, predicate, literal.term));
        return literal;
    } // Node#setLiteral

    /**
     * @param {string} prop
     * @returns {void}
     */
    deleteLiteral(prop) {
        _.assert(this.isLoaded(prop), 'Node#deleteLiteral : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        _.assert(objects.length <= 1, 'Node#deleteLiteral : can only set a literal on a single value property');
        if (objects.length > 0) {
            const previousLiteral = this.#termToOptionalLiteral(objects[0]);
            _.assert(previousLiteral, 'Node#deleteLiteral : can only set a literal on a literal property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
    } // Node#deleteLiteral

    /**
     * @param {string} prop
     * @returns {Array<_space.Node>}
     */
    getNodes(prop) {
        _.assert(this.isLoaded(prop), 'Node#getNodes : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        return objects.map(term => this.#termToOptionalNode(term)).filter(node => node);
    } // Node#getNodes

    /**
     * @param {string} prop
     * @param {Array<_space.Node>} values
     * @returns {Array<_space.Node>}
     */
    setNodes(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#setNodes : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#setNodes : expected values to be an array', TypeError);
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        const nodes   = values.map(value => this.#space.getNode(value));
        if (objects.length > 0) {
            const previousNodes = objects.map(term => this.#termToOptionalNode(term)).filter(node => node);
            _.assert(previousNodes.length === objects.length, 'Node#setNodes : can only set nodes on a node property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        for (let node of nodes) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, node.term));
        }
        return nodes;
    } // Node#setNodes

    /**
     * @param {string} prop
     * @param {Array<_space.Node>} values
     * @returns {void}
     */
    addNodes(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#addNodes : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#addNodes : expected values to be an array', TypeError);
        const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
        const nodes   = values.map(value => this.#space.getNode(value));
        if (objects.length > 0) {
            const previousNodes = objects.map(term => this.#termToOptionalNode(term)).filter(node => node);
            _.assert(previousNodes.length === objects.length, 'Node#addNodes : can only add nodes on a node property');
        }
        for (let node of nodes) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, node.term));
        }
    } // Node#addNodes

    /**
     * @param {string} prop
     * @param {Array<_space.Node>} [values]
     * @returns {void}
     */
    deleteNodes(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#deleteNodes : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        values          = _.toArray(values);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        const nodes     = values.map(value => this.#space.getNode(value));
        if (objects.length > 0) {
            const previousNodes = objects.map(term => this.#termToOptionalNode(term)).filter(node => node);
            _.assert(previousNodes.length === objects.length, 'Node#deleteNodes : can only delete nodes on a node property');
            if (nodes.length > 0) {
                for (let node of nodes) {
                    this.#currentData.deleteMatches(this.term, predicate, node.term);
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
        const predicate = this.#factory.namedNode(prop);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        return objects.map(term => this.#termToOptionalLiteral(term)).filter(node => node);
    } // Node#getLiterals

    /**
     * @param {string} prop
     * @param {Array<_space.Literal>} values
     * @returns {Array<_space.Literal>}
     */
    setLiterals(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#setLiterals : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#setLiterals : expected values to be an array', TypeError);
        const objects  = Array.from(this.#currentData.match(this.term, predicate).objects());
        const literals = values.map(value => this.#space.getLiteral(value));
        if (objects.length > 0) {
            const previousLiterals = objects.map(term => this.#termToOptionalLiteral(term)).filter(literal => literal);
            _.assert(previousLiterals.length === objects.length, 'Node#setLiterals : can only set literals on a literal property');
            this.#currentData.deleteMatches(this.term, predicate);
        }
        for (let literal of literals) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, literal.term));
        }
        return literals;
    } // Node#setLiterals

    /**
     * @param {string} prop
     * @param {Array<_space.Literal>} values
     * @returns {void}
     */
    addLiterals(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#addLiterals : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        values          = _.toArray(values);
        _.assert(values.length > 0, 'Node#addLiterals : expected values to be an array', TypeError);
        const objects  = Array.from(this.#currentData.match(this.term, predicate).objects());
        const literals = values.map(value => this.#space.getLiteral(value));
        if (objects.length > 0) {
            const previousLiterals = objects.map(term => this.#termToOptionalLiteral(term)).filter(literal => literal);
            _.assert(previousLiterals.length === objects.length, 'Node#addLiterals : can only add literals on a literal property');
        }
        for (let literal of literals) {
            this.#currentData.add(this.#factory.quad(this.term, predicate, literal.term));
        }
    } // Node#addLiterals

    /**
     * @param {string} prop
     * @param {Array<_space.Literal>} [values]
     * @returns {void}
     */
    deleteLiterals(prop, values) {
        _.assert(this.isLoaded(prop), 'Node#deleteLiterals : prop not loaded');
        const predicate = this.#factory.namedNode(prop);
        values          = _.toArray(values);
        const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
        const literals  = values.map(value => this.#space.getLiteral(value));
        if (objects.length > 0) {
            const previousLiterals = objects.map(term => this.#termToOptionalLiteral(term)).filter(literal => literal);
            _.assert(previousLiterals.length === objects.length, 'Node#deleteLiterals : can only delete literals on a literal property');
            if (literals.length > 0) {
                for (let literal of literals) {
                    this.#currentData.deleteMatches(this.term, predicate, literal.term);
                }
            } else {
                this.#currentData.deleteMatches(this.term, predicate);
            }
        }
    } // Node#deleteLiterals

    /**
     * @param {Array<string>} [props]
     * @returns {Promise<void>}
     */
    async load(props) {
        const store      = this.#space.getStore(_.SECRET);
        props            = _.toArray(props);
        const _typeIndex = props.indexOf('@type');
        if (_typeIndex >= 0) {
            props.splice(_typeIndex, 1, _.iris.rdf_type);
        } else if (props.length > 0 && !this.isLoaded(_.iris.rdf_type)) {
            props.push(_.iris.rdf_type);
        }
        if (props.length > 0) {
            const predicates     = props.map(prop => this.#factory.namedNode(prop));
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
    } // Node#load

    /**
     * @param {Array<string>} [props]
     * @returns {Promise<void>}
     */
    async save(props) {
        const store      = this.#space.getStore(_.SECRET);
        props            = _.toArray(props);
        const _typeIndex = props.indexOf('@type');
        if (_typeIndex >= 0) {
            props.splice(_typeIndex, 1, _.iris.rdf_type);
        }
        let addData, deleteData;
        if (props.length > 0) {
            const predicates = props.map(prop => this.#factory.namedNode(prop));
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
        // const [addCount, deleteCount] =
        await Promise.all([
            addData.size > 0 ? store.add(addData) : 0,
            deleteData.size > 0 ? store.delete(deleteData) : 0
        ]);
    } // Node#save

    toJSON() {
        const result   = {'@id': this.id};
        const rdf_type = this.#factory.namedNode(_.iris.rdf_type);
        for (let predicate of this.#currentData.match(this.term).predicates()) {
            if (rdf_type.equals(predicate)) {
                const objects   = Array.from(this.#currentData.match(this.term, predicate).objects());
                result['@type'] = objects.map(term => this.#factory.termToId(term));
            } else {
                const key     = this.#factory.termToId(predicate);
                const objects = Array.from(this.#currentData.match(this.term, predicate).objects());
                result[key]   = objects.map((term) => {
                    const literal = this.#termToOptionalLiteral(term);
                    if (literal) return literal.toJSON();
                    const node = {'@id': this.#factory.termToId(term)};
                    return node;
                });
            }
        }
        return result;
    } // Node#toJSON

}; // Node
