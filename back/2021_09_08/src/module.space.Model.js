const
    _      = require('./module.space.util.js'),
    _space = require('./module.space.js');

module.exports = class Model extends _.ProtectedEmitter {

    /** @type {_space.Space} */
    #space = null;

    constructor() {
        super();
    } // Model#constructor

    define() {

    }

}; // Model
