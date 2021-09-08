const
    {Model} = require('../src/module.space.js'),
    LDP     = module.exports = new Model();

LDP.define('ldp:Resource', {
    constructor(id) {
        this['@id'] = id;
    },
    /** @this {Dataset} */
    get member() {
        const memberTripel = this.match(null, this.factory.namedNode('ldp:member'));
        return memberTripel.objects();
    },
    /** @this {Dataset} */
    addMember(member) {
        const memberTripel = this.factory.quad(
            this.factory.namedNode(this['@id']),
            this.factory.namedNode('ldp:member'),
            this.factory.namedNode(member)
        );
        this.add(memberTripel);
    }
});
