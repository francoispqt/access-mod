'use strict';

const assert = require('assert');

const AccessMod = require('../');
let am = new AccessMod();

// Test n1
class Test {
    constructor(){
        assert(arguments['0'] === 'test');
        assert(arguments['1'] === 'test2');

        this.__privateProp = true;
        this._protectedProp = true;
        this.publicProp = true;

        this['protected prop'] = true;
        this['private prop']= true;
    }

    'private privateMeth'()
    {
        return 1;
    }

    'protected protectedMeth'()
    {
        return 2;
    }

    // private
    __lodashPrivateMeth(){
        return 3;
    }

    // protected
    _lodashProtectedMeth(){
        return 4;
    }

    publicMeth(){
        return  am.get('_lodashProtectedMeth')() +
                am.get('__lodashPrivateMeth')() +
                am.get('protected protectedMeth')() +
                am.get('private privateMeth')();
    }

}

const t = new (am.new(Test))('test', 'test2');
assert(t._lodashProtectedMeth === undefined);
assert(t.__privateMeth === undefined);
assert(t.publicMeth !== undefined);
assert(t.publicMeth() === 10);
console.info('---- \\o/ Test n1 successful !');

let nAm = new AccessMod();
// Test n2 inheritance
class TestChild extends am.inherit((pam) => { am = pam; return Test; }) {
    constructor(){
        super('test', 'test2');
    }

    __privChildMeth(){
        return 2;
    }

    _protChildMeth(){
        return 1;
    }

    pubChildMeth(){
        assert(nAm.get('__privateMeth') === undefined);
        // calling parent prot meth and local private meth
        return nAm.get('_lodashProtectedMeth')() + nAm.get('__privChildMeth')() + nAm.get('_protChildMeth')();
    }
}

const tC = new (nAm.new(TestChild))();

assert(tC.__privateMeth === undefined);
assert(tC._lodashProtectedMeth === undefined);
assert(tC._protChildMeth === undefined);
assert(tC.pubChildMeth() === 7);
console.info('---- \\o/ Test n2 successful !');
process.exit(0);
