"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRebository = void 0;
const user_model_1 = __importDefault(require("../model/user.model"));
const db_rebos_1 = __importDefault(require("./db.rebos"));
const classError_1 = require("../../utils/classError");
class UserRebository extends db_rebos_1.default {
    constructor(model) {
        super(user_model_1.default);
        this.model = model;
    }
    async createOne(data) {
        const user = await this.model.create(data);
        if (!user) {
            throw new classError_1.appError("user not found", 404);
        }
        return user;
    }
}
exports.UserRebository = UserRebository;
