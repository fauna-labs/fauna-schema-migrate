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
exports.HeaderMessage = void 0;
var message_1 = require("./message");
var HeaderMessage = /** @class */ (function (_super) {
    __extends(HeaderMessage, _super);
    function HeaderMessage(message, subtitle) {
        var _this = _super.call(this, message) || this;
        _this.subtitle = subtitle;
        return _this;
    }
    return HeaderMessage;
}(message_1.Message));
exports.HeaderMessage = HeaderMessage;
