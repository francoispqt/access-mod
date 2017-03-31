# access-mod
Utility that brings private and protected access modifiers to ES2015 Classes

Must have support ES2015 support for Proxies and Symbols

## HOW TO USE

### Examples
Simple usage :
``` javascript

// FILE access-modified.js
// --------------------------------------------------------
'use strict';

const AccessMod = require('access-mod');

let am = new AccessMod();

class AccessModified {
    constructor(){

    }
    // will not be accessible outside class or to parent
    __privateMethod(){}
    'private method'(){}

    // will not be accessible outside class but will be to parent
    _protectedMethod(){}
    'protected method'(){}

    // will be accessible everywhere
    publicMethod(){
        // access private or protected property
        let privateProp = am.get('__privateProperty');
    }

}

module.exports = am.new(AccessModified);
// --------------------------------------------------------

// FILE index.js
// --------------------------------------------------------
'use strict';

const AccessModified;

// only public properties will be available to class
let am = new AccessModified();
```

With inheritance
``` javascript
// FILE access-mod-parent.js
// --------------------------------------------------------
'use strict';

module.exports = (am) => class AccModParent {
    constructor(){
        this.__privateProperty = 'this is private.';
    }

    // will not be accessible outside class or to parent or to child
    __privateMethod(){}
    'private method'(){}

    // will not be accessible outside class but will be to parent and child
    _protectedMethod(){
        console.log('hello world !');
    }
    'protected method'(){}
}


// FILE access-mod-child.js
// --------------------------------------------------------
'use strict';

const AccessMod = require('access-mod');
const AccModParent = require('./access-mod-parent');

let am = new AccessMod();

class AccModChild extends am.inherit(AccModParent) {
    constructor(){

    }

    publicMethod(){
        // called from parent
        am.get('_protectedMethod')() // hello world !
    }
}

let accModChild = new (am.new(accModChild))();
```
