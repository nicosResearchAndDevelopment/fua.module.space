const
    _            = require('./module.space.util.js'),
    _space       = require('./module.space.js'),
    _persistence = require('@nrd/fua.module.persistence');

module.exports = class Space extends _.ProtectedEmitter {

    #dataStore = null;

    /**
     * @param {Object} param
     * @param {_persistence.DataStore} param.dataStore
     */
    constructor(param) {
        _.assert(_.isObject(param), 'Space#constructor : expected param to be an object', TypeError);
        _.assert(param.dataStore instanceof _persistence.DataStore, 'Space#constructor : expected param.dataStore to be a DataStore', TypeError);
        super();
        this.#dataStore = param.dataStore;
        this.factory    = this.#dataStore.factory;
        _.lockAllProp(this);
    } // Space#constructor

}; // Space
