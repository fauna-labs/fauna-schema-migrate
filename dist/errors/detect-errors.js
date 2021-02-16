"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMissingMigrationCollectionFaunaError = exports.isSchemaCachingFaunaError = void 0;
var isSchemaCachingFaunaError = function (e) {
    var res = safeVerifyError(e, ['requestResult', 'responseContent', 'errors', 0, 'failures', 0]);
    if (res && res.code === 'duplicate value') {
        return res.description;
    }
};
exports.isSchemaCachingFaunaError = isSchemaCachingFaunaError;
var isMissingMigrationCollectionFaunaError = function (e) {
    var res = safeVerifyError(e, ['requestResult', 'responseContent', 'errors', 0]);
    if (res && res.code === 'invalid ref' && res.description.includes("migrations")) {
        return res.description;
    }
};
exports.isMissingMigrationCollectionFaunaError = isMissingMigrationCollectionFaunaError;
var safeVerifyError = function (error, keys) {
    if (keys.length > 0) {
        if (error && error[keys[0]]) {
            var newError = error[keys[0]];
            keys.shift();
            return safeVerifyError(newError, keys);
        }
        else {
            return false;
        }
    }
    return error;
};
