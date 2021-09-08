const
    InmemoryStore = require('@nrd/fua.module.persistence.inmemory'),
    {Space}       = require('./module.space.js');

const space = new Space({
    dataStore: new InmemoryStore()
});

console.log(space);
