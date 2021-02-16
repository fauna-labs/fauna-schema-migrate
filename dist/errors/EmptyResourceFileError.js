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
exports.EmptyResourceFileError = void 0;
var EmptyResourceFileError = /** @class */ (function (_super) {
    __extends(EmptyResourceFileError, _super);
    function EmptyResourceFileError(filePath) {
        var _this = this;
        var message = "The following resource file did not return an FQL snippet.\n        Is the FQL file empty or did you forget the default export in the JS file?\n        " + filePath + "\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, EmptyResourceFileError.prototype);
        return _this;
    }
    return EmptyResourceFileError;
}(Error));
exports.EmptyResourceFileError = EmptyResourceFileError;
