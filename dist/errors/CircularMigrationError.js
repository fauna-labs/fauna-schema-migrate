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
exports.CircularMigrationError = void 0;
var CircularMigrationError = /** @class */ (function (_super) {
    __extends(CircularMigrationError, _super);
    function CircularMigrationError(m) {
        var _this = this;
        var names = m.map(function (e) { return e.type + "(\"" + e.name + "\")"; });
        var message = "The following migrations can not be placed in a transaction since they contain circular dependencies\n  " + names.join('\n  ') + "\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, CircularMigrationError.prototype);
        return _this;
    }
    return CircularMigrationError;
}(Error));
exports.CircularMigrationError = CircularMigrationError;
