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
exports.WrongResourceTypeError = void 0;
var print_1 = require("../fql/print");
var resource_types_1 = require("../types/resource-types");
var WrongResourceTypeError = /** @class */ (function (_super) {
    __extends(WrongResourceTypeError, _super);
    function WrongResourceTypeError(expr) {
        var _this = this;
        var message = "\n        Only statements that start with the functions:\n          " + listCreateResourceTypes().join('\n          ') + "\n        are allowed in the RESOURCES folder.\n        Received Statement\n        --------------\n        " + print_1.prettyPrintExpr(expr.fqlExpr) + "\n        --------------\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, WrongResourceTypeError.prototype);
        return _this;
    }
    return WrongResourceTypeError;
}(Error));
exports.WrongResourceTypeError = WrongResourceTypeError;
var listCreateResourceTypes = function () {
    var res = [];
    for (var r in resource_types_1.ResourceTypes) {
        res.push("Create" + r);
    }
    return res;
};
