export class DbRebository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return await this.model.create(data);
    }
    async findOne(filter, select) {
        return await this.model.findOne(filter, select);
    }
    async updateOne(filter, update) {
        return await this.model.updateOne(filter, update);
    }
}
export default DbRebository;
