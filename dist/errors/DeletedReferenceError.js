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
exports.DeletedReferenceError = void 0;
var DeletedReferenceError = /** @class */ (function (_super) {
    __extends(DeletedReferenceError, _super);
    function DeletedReferenceError(te_referenced, te) {
        var _this = this;
        var message = "\nThe following resource was deleted\n    type: " + te_referenced.type + ", name: " + te_referenced.name + "\nyet was referenced from:\n    type: " + te.type + ", name: " + te.name + "\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, DeletedReferenceError.prototype);
        return _this;
    }
    return DeletedReferenceError;
}(Error));
exports.DeletedReferenceError = DeletedReferenceError;
