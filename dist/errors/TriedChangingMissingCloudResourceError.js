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
exports.TriedChangingMissingCloudResourceError = void 0;
var TriedChangingMissingCloudResourceError = /** @class */ (function (_super) {
    __extends(TriedChangingMissingCloudResourceError, _super);
    function TriedChangingMissingCloudResourceError(m) {
        var _this = this;
        var message = "Migration calculation requires a change to a resource " + m.type + "(\"" + m.name + "\") which is no longer present in cloud";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, TriedChangingMissingCloudResourceError.prototype);
        return _this;
    }
    return TriedChangingMissingCloudResourceError;
}(Error));
exports.TriedChangingMissingCloudResourceError = TriedChangingMissingCloudResourceError;
