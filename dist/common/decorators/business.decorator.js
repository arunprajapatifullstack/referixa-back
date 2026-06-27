"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessId = void 0;
const common_1 = require("@nestjs/common");
exports.BusinessId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.businessId || request.user?.sub;
});
//# sourceMappingURL=business.decorator.js.map