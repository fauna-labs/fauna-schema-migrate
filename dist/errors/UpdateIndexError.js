"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIndexError = void 0;
var UpdateIndexError = /** @class */ (function (_super) {
    __extends(UpdateIndexError, _super);
    function UpdateIndexError(m) {
        var _this = this;
        var names = m.map(function (e) {
            var _a;
            return '- ' + ((_a = e.target) === null || _a === void 0 ? void 0 : _a.name);
        });
        var message = "Tried to update indexes with names:\n        " + names.join('\n  ') + "\n\n        Indexes can't be updated and have to be recreated.\n        A workaround procedure to replace an index is to:\n        1. Migration1:\n        - Create a new index with a new name\n        2. Manual:\n        - Wait for the index to be active (the active boolean on the index has to be true)\n        3. Migration2:\n        - Update your FQL (e.g. your UDFs or update your application code) to use the new index\n        - Once everything is using the new index, delete the old index\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, UpdateIndexError.prototype);
        return _this;
    }
    return UpdateIndexError;
}(Error));
exports.UpdateIndexError = UpdateIndexError;
