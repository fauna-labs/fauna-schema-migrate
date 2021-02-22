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
exports.ExpectedNumberOfMigrations = void 0;
var ExpectedNumberOfMigrations = /** @class */ (function (_super) {
    __extends(ExpectedNumberOfMigrations, _super);
    function ExpectedNumberOfMigrations(m) {
        var _this = this;
        var message = "Expected parameter of type number or the string \"all\" for the amount of migrations to apply/rollback, received " + m;
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, ExpectedNumberOfMigrations.prototype);
        return _this;
    }
    return ExpectedNumberOfMigrations;
}(Error));
exports.ExpectedNumberOfMigrations = ExpectedNumberOfMigrations;
