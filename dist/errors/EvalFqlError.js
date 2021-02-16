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
exports.EvalFqlError = void 0;
var EvalFqlError = /** @class */ (function (_super) {
    __extends(EvalFqlError, _super);
    function EvalFqlError(err, fql) {
        var _this = this;
        // Todo JSlint the fql string to get decent errors.
        var message = "\nFailed to evaluate FQL expression with SyntaxError:\n" + err + "\n--------------\n" + fql + "\n--------------\n        ";
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, EvalFqlError.prototype);
        return _this;
    }
    return EvalFqlError;
}(Error));
exports.EvalFqlError = EvalFqlError;
