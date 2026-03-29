"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbRebository = void 0;
class DbRebository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return await this.model.create(data);
    }
    async findOne(filter, select) {
        return await this.model.findOne(filter, select);
    }
}
exports.DbRebository = DbRebository;
exports.default = DbRebository;
