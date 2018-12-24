'use strict';

var _ = require('lodash');

module.exports.clone = function(value) {
    return _.cloneDeep(value);
};
module.exports.generateCode = function(salt = '', length = 10) {
    var code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    return salt + code.slice(0, length);
};

module.exports.simple = function(a) {
    return a;
};
module.exports.echoArgument = function(msg) {
    return function(a) {
        console.log(msg, a);

        return a;
    }
};

module.exports.addedSign = function(a) {
    return a > 0 ? '+' + a : a
};

module.exports.addition = function(a, b) {
    return a + b;
};
module.exports.subtraction = function(a, b) {
    return a - b;
};
module.exports.multiplication = function(a, b) {
    return a * b;
};
module.exports.division = function(a, b) {
    return a / b;
};
module.exports.union = function(a, b) {
    return function(value) {
        return b(a(value));
    }
};
module.exports.i_union = function(a) {
    return function(b) {
        return function(value) {
            return b(a(value));
        };
    };
};

module.exports.lAddition = function(l) {
    return _.reduce(l, addition, 0);
};
module.exports.lMultiplication = function(l) {
    return _.reduce(l, multiplication, 1);
};
module.exports.lMapApply = function(lF, value) {
    return _.map(lF, function(f) {
        return f(value);
    });
};
module.exports.lUnion = function(lF) {
    return _.reduce(lF, union, simple);
};
module.exports.lUnionLists = function(l) {
    return _.reduce(l, function(result, item) {
        return _.union(result, item);
    }, []);
};
module.exports.lRandom = function(l) {
    if (l.length === 0) {
        return undefined;
    }

    const key = _.random(0, l.length - 1);

    return l[key];
};

module.exports.oGet = function(obj, key, def) {
    return undefined !== obj[key] ? obj[key] : def;
};
module.exports.oSet = function(obj, key, value) {
    obj[key] = value;

    return obj;
};
module.exports.oUpdate = function(obj, key, f) {
    return oSet(obj, key, f(oGet(obj, key)));
};

module.exports.oMapApply = function(oF, value) {
    return _.reduce(_.keys(oF), function(result, key) {
        return oSet(result, key, oGet(oF, key)(value));
    }, {});
};
module.exports.oRemoveKeys = function(oF, predicate) {
    const keys = _.filter(_.keys(oF), predicate);

    _.forEach(keys, function(key) {
        delete oF[key];
    });

    return oF;
};

module.exports.isAlwaysOk = function() {
    return function() {
        return true;
    }
};
module.exports.isNull = function() {
    return function(value) {
        return null === value;
    }
};
module.exports.isNotNull = function() {
    return function(value) {
        return null !== value;
    }
};
module.exports.isEqual = function(available) {
    return function(value) {
        return value === available;
    };
};
module.exports.isGreatOrEqual = function(available) {
    return function(value) {
        return value >= available;
    };
};
module.exports.isIn = function(available) {
    return function(value) {
        return -1 !== _.indexOf(available, value);
    };
};
module.exports.isNotIn = function(available) {
    return function(value) {
        return -1 === _.indexOf(available, value);
    };
};
module.exports.isModule = function(available) {
    return function(value) {
        return 0 === value % available;
    };
};

module.exports.curry = function(f, b) {
    return function(a) {
        return f(a, b);
    };
};

module.exports.promiseAllObj = function(promisesObj) {
    const resultToObj = function(key) {
        return function(result) {
            const resultObj = {};
            resultObj[key] = result;
            return resultObj;
        }
    };

    const promisesRunner = function(objectOfPromises) {
        return function(key) {
            return objectOfPromises[key]().then(resultToObj(key));
        };
    };
    const runPromiseWithPackResult = promisesRunner(promisesObj);

    const promises = _.map(_.keys(promisesObj), runPromiseWithPackResult);

    return Promise
        .all(promises)
        .then(function(values) {
            return _.assignIn.call(arguments);
        });
};
module.exports.promiseTime = function(promise, label) {
    console.time(label);

    return promise()
        .then(function(result) {
            console.timeEnd(label);

            return result;
        });
};
module.exports.wrapPromisesTimer = function(promisesObj) {
    const promises = {};

    _.map(_.keys(promisesObj), function(promiseKey) {
        promises[promiseKey] = function() {
            return promiseTime(promisesObj[promiseKey], 'promise ' + promiseKey);
        };
    });

    return promises;
};
