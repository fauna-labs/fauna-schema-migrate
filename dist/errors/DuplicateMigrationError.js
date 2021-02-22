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
exports.DuplicateMigrationError = void 0;
var DuplicateMigrationError = /** @class */ (function (_super) {
    __extends(DuplicateMigrationError, _super);
    function DuplicateMigrationError(m) {
        var _this = this;
        var message = "A duplicate migration exists with the type " + m.type + "(\"" + m.name + "\")";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, DuplicateMigrationError.prototype);
        return _this;
    }
    return DuplicateMigrationError;
}(Error));
exports.DuplicateMigrationError = DuplicateMigrationError;
