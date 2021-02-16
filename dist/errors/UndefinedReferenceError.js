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
exports.UndefinedReferenceError = void 0;
var UndefinedReferenceError = /** @class */ (function (_super) {
    __extends(UndefinedReferenceError, _super);
    function UndefinedReferenceError(te) {
        var _this = this;
        var message = "\nThe following resource is not defined anywhere in the resource folders\n    type: " + te.type + ", name: " + te.name + "\nand was referenced from:\n    type: " + te.resource.type + ", name: " + te.resource.name + "\n\ntodo: add a boolean to bypass this error in case users\n      want to reference resources that were defined manually.\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, UndefinedReferenceError.prototype);
        return _this;
    }
    return UndefinedReferenceError;
}(Error));
exports.UndefinedReferenceError = UndefinedReferenceError;
