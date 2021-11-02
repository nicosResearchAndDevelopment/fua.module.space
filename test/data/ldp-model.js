const
    _space = require('../../src/module.space.js'),
    LDP    = new _space.Model();

LDP.set('ldp:Resource', class Resource extends _space.Resource {

});

LDP.set('ldp:RDFSource', class RDFSource extends LDP.get('ldp:Resource') {

});

LDP.set('ldp:NonRDFSource', class NonRDFSource extends LDP.get('ldp:Resource') {

});

LDP.set('ldp:Container', class Container extends LDP.get('ldp:RDFSource') {

    async contains() {
        if (!this.node.isLoaded('ldp:contains'))
            await this.node.load('ldp:contains');
        return this.node.getNodes('ldp:contains').map(node => node.id);
    }

});

LDP.set('ldp:BasicContainer', class BasicContainer extends LDP.get('ldp:Container') {

});

LDP.set('ldp:DirectContainer', class DirectContainer extends LDP.get('ldp:Container') {

});

LDP.set('ldp:IndirectContainer', class IndirectContainer extends LDP.get('ldp:Container') {

});

module.exports = LDP.finish();
