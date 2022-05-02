const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

// FIXME setting an array with multiple entries of the same object might ignore cardinality restrictions

class DefaultTarget {

    constructor() {
        _.assert(false, 'the DefaultTarget cannot automatically be constructed');
    } // DefaultTarget#constructor

    static [Symbol.hasInstance](target) {
        return (target instanceof _space.Resource) || (target instanceof _space.Literal);
    } // DefaultTarget@@hasInstance

} // DefaultTarget

/**
 * @alias fua.module.space.Property
 * @template {Object} TargetClass=DefaultTarget
 */
module.exports = class Property {

    /** @type {Set<TargetClass>} */
    #references     = new Set();
    /** @type {typeof TargetClass} */
    #referenceType  = DefaultTarget;
    /** @type {number} */
    #minCardinality = 0;
    /** @type {number} */
    #maxCardinality = Number.MAX_SAFE_INTEGER;
    /** @type {boolean} */
    #locked         = false;

    /**
     * @param {typeof TargetClass} [referenceType=fua.module.space.Resource]
     * @param {number} [minCardinality=0]
     * @param {number} [maxCardinality=Number.MAX_SAFE_INTEGER]
     * @param {TargetClass|Array<TargetClass>|null} [defaultTarget=null]
     */
    constructor(referenceType, minCardinality, maxCardinality, defaultTarget) {
        if (_.isNotNull(referenceType)) {
            if (!_.isFunction(referenceType))
                throw new Error('expected referenceType to be a function');
            if (!Object.isPrototypeOf(referenceType))
                throw new Error('expected referenceType to be a subclass of Object');
            this.#referenceType = referenceType;
        }
        if (_.isNotNull(minCardinality)) {
            if (!_.isInteger(minCardinality))
                throw new Error('expected minCardinality to be an integer');
            if (minCardinality < 0)
                throw new Error('expected minCardinality to be >= 0');
            if (minCardinality > Number.MAX_SAFE_INTEGER)
                throw new Error('expected minCardinality to be <= ' + Number.MAX_SAFE_INTEGER);
            this.#minCardinality = minCardinality;
        }
        if (_.isNotNull(maxCardinality)) {
            if (!_.isInteger(maxCardinality))
                throw new Error('expected maxCardinality to be an integer');
            if (maxCardinality < 1)
                throw new Error('expected maxCardinality to be >= 1');
            if (maxCardinality < this.#minCardinality)
                throw new Error('expected maxCardinality to be >= ' + this.#minCardinality);
            if (maxCardinality > Number.MAX_SAFE_INTEGER)
                throw new Error('expected maxCardinality to be <= ' + Number.MAX_SAFE_INTEGER);
            this.#maxCardinality = maxCardinality;
        }
        if (_.isNotNull(defaultTarget)) {
            this.set(defaultTarget);
        }
    } // Property#constructor

    get locked() {
        return this.#locked;
    } // Property#locked

    get empty() {
        return this.#references.size === 0;
    } // Property#empty

    get size() {
        return this.#references.size
    } // Property#size

    /**
     * @returns {TargetClass|Array<TargetClass>|null}
     */
    get() {
        if (this.#maxCardinality > 1) {
            return Array.from(this.#references);
        } else if (this.#references.size > 0) {
            return this.#references.values().next().value;
        } else {
            if (this.#minCardinality > 0)
                throw new Error('expected to be defined');
            return null;
        }
    } // Property#set

    /**
     * @param {TargetClass|Array<TargetClass>|null} target
     * @returns {TargetClass|Array<TargetClass>|null}
     */
    set(target) {
        if (this.#locked)
            throw new Error('this property has been locked');
        if (_.isArray(target)) {
            if (target.length < this.#minCardinality)
                throw new Error('expected target to have a length of >= ' + this.#minCardinality);
            if (target.length > this.#maxCardinality)
                throw new Error('expected target to have a length of <= ' + this.#maxCardinality);
            target = target.map(entry => (entry instanceof this.#referenceType) && entry || new this.#referenceType(entry));
            this.#references.clear();
            target.forEach(entry => this.#references.add(entry));
            return target;
        } else {
            if (target) {
                target = (target instanceof this.#referenceType) && target || new this.#referenceType(target);
                this.#references.clear();
                this.#references.add(target);
                return target;
            } else {
                if (this.#minCardinality > 0)
                    throw new Error('expected target to be not empty');
                this.#references.clear();
                return null;
            }
        }
    } // Property#set

    /**
     * @returns {IterableIterator<TargetClass>}
     */
    entries() {
        return this.#references.values();
    } // Property#entries

    /**
     * @param {TargetClass} target
     * @returns {TargetClass}
     */
    add(target) {
        if (this.#locked)
            throw new Error('this property has been locked');
        if (this.#references.size + 1 > this.#maxCardinality)
            throw new Error('expected to not have more entries than ' + this.#maxCardinality);
        target = (target instanceof this.#referenceType) && target || new this.#referenceType(target);
        this.#references.add(target);
        return target;
    } // Property#add

    /**
     * @param {TargetClass} target
     * @returns {TargetClass}
     */
    remove(target) {
        if (this.#locked)
            throw new Error('this property has been locked');
        if (this.#references.size - 1 < this.#minCardinality)
            throw new Error('expected to not have less entries than ' + this.#minCardinality);
        target = (target instanceof this.#referenceType) && target || new this.#referenceType(target);
        this.#references.delete(target);
        return target;
    } // Property#remove

    lock() {
        this.#locked = true;
        return this;
    } // Property#lock

    /**
     * @returns {TargetClass|Array<TargetClass>|null}
     */
    toJSON() {
        if (this.#maxCardinality > 1) {
            const target = Array.from(this.#references);
            return target.map((entry) => {
                if (entry['@id']) return {'@id': entry['@id']};
                if (entry.id) return {'@id': entry.id};
                if (entry.toJSON) return entry.toJSON();
                return entry;
            });
        } else if (this.#references.size > 0) {
            const target = this.#references.values().next().value;
            if (target['@id']) return {'@id': target['@id']};
            if (target.id) return {'@id': target.id};
            if (target.toJSON) return target.toJSON();
            return target;
        } else {
            return null;
        }
    } // Property#toJSON

} // Property
