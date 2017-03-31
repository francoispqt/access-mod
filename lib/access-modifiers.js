'use strict';

const resetPriv = Symbol('resetPriv');
const fC = Symbol('fC');
const i = Symbol('i');
const accessors = Symbol('accessors');
const setAccessors = Symbol('setAccessors');

const RESERVED = [
  '__defineGetter__',
  '__lookupGetter__',
  '__defineSetter__',
  '__lookupSetter__',
];

const isPrivate = function(val){
    if (typeof val === 'string') {
        return val.substring(0, 7) === 'private' ||  val.substring(0, 2) === '__';
    }
    return false;
};

const isProtected = function(val){
    if (typeof val === 'string') {
        return val.substring(0, 9) === 'protected'  || (val.substring(0, 1) === '_' && val.substring(0, 2) !== '__');
    }
    return false;
};

class NotFoundPropertyError extends Error {
    constructor(msg){
        super(msg);
    }
}

function getProps(obj) {
    let props = [];
    do {
        props = props.concat(Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));
    return props;
}

class AccessModifiers {
    constructor(){
        this[accessors] = {
            accPrivate: Symbol('accPrivate'),
            accProtected: Symbol('accProtected'),
            resetPriv: Symbol('resetPriv')
        };
        this[this[accessors].accPrivate] = {};
        this[this[accessors].accProtected] = {};
        return this;
    }

    new(Class){
        let self = this;
        let pr = new Proxy(Class, {
            construct: function(T, args, nT) {
                let newT = new T(...args);
                let allProps = getProps(newT);
                self[fC] = newT;
                allProps.forEach(prop => {
                    if (!RESERVED.includes(prop)) {
                        if ( isPrivate(prop) ) {
                            if (typeof newT[prop] === 'function') {
                                newT[self.private(prop)] = newT[prop].bind(newT);
                            } else {
                                newT[self.protected(prop)] = newT[prop];
                            }
                            newT[prop] = undefined;
                        } else if ( isProtected(prop) ) {
                            if (typeof newT[prop] === 'function') {
                                newT[self.protected(prop)] = newT[prop].bind(newT);
                            } else {
                                newT[self.protected(prop)] = newT[prop];
                            }
                            newT[prop] = undefined;
                        }
                    }
                });

                return newT;
            }
        });
        return pr;
    }

    private(i, cName){
        let s = Symbol(i);
        this[this[accessors].accPrivate] = this[this[accessors].accPrivate] || {};
        this[this[accessors].accPrivate][i] = s;
        return this[this[accessors].accPrivate][i];
    }

    protected(i, cName){
        let s = Symbol(i);
        this[this[accessors].accProtected][i] = s;
        return this[this[accessors].accProtected][i];
    }

    get(i){
        let res = this[fC][this[this[accessors].accPrivate][i]] || this[fC][this[this[accessors].accProtected][i]];
        return res;
    }

    getPrivate(i){
        let s = this[this[accessors].accPrivate][i];
        return this[fC][s];
    }
    getProtected(i){
        let s = this[this[accessors].accProtected][i];
        return this[fC][s];
    }

    inherit(c){
        let nAm = new AccessModifiers();
        let self = this;
        let C = c(nAm);
        class t extends C {
            constructor(){
                super(...arguments);
                nAm[setAccessors](self[accessors], self[self[accessors].accProtected]);
                nAm[resetPriv]();
                return nAm.protectInstance(this, getProps(C.prototype));
            }
        }
        return t;
    }

    protectInstance(instance, allProps){
        this[fC] = instance;
        allProps.forEach(prop => {
            if ( isPrivate(prop) && !RESERVED.includes(prop) ) {
                if (typeof instance[prop] === 'function') {
                    instance[this.private(prop)] = instance[prop].bind(instance);
                }
                instance[prop] = undefined;
            }
        });
        return instance;
    }

    set(c){
        this[fC] = c;
    }

    [resetPriv](){
        let newPriv = Symbol('accPrivate');
        this[accessors].accPrivate = newPriv;
        this[this[accessors].accPrivate] = {};
        return this;
    }

    [setAccessors](acc, protecteds){
        this[accessors] = acc;
        this[this[accessors].accProtected] = protecteds;
    }
}

module.exports = AccessModifiers;
