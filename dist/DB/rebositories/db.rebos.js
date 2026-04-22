export class DbRebository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return await this.model.create(data);
    }
    async find({ filter, select, options, }) {
        return await this.model.find(filter, select, options);
    }
    async findOne(filter, select, options) {
        return await this.model.findOne(filter, select, options);
    }
    async findById(id, select, options) {
        return await this.model.findById(id, select, options);
    }
    async findOneAndUpdate(filter, update, options = { new: true }) {
        return await this.model.findOneAndUpdate(filter, update, options);
    }
    async updateOne(filter, update) {
        return await this.model.updateOne(filter, update);
    }
    async deleteOne(filter) {
        return await this.model.deleteOne(filter);
    }
    async findOneAndDelete(filter) {
        return await this.model.findOneAndDelete(filter);
    }
    async paginate({ filter, select, options, query, }) {
        let { page = 1, limit = 5 } = query;
        if (page < 0)
            page = 1;
        page = page * 1 || 1;
        const skip = (page - 1) * limit;
        const finalOptions = {
            ...options,
            skip,
            limit,
        };
        const count = await this.model.countDocuments({
            deletedAt: { $exists: false },
        });
        const numberOfPages = Math.ceil(count / limit);
        const docs = await this.model.find(filter, select, finalOptions);
        return { docs, currentpage: page, countDocuments: count, numberOfPages };
    }
}
export default DbRebository;
//# sourceMappingURL=db.rebos.js.map