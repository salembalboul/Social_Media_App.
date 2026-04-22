import {
  HydratedDocument,
  ProjectionType,
  QueryFilter,
  UpdateQuery,
} from "mongoose";
import { QueryOptions } from "mongoose";
import { DeleteResult } from "mongoose";
import { Model } from "mongoose";
import { UpdateWriteOpResult } from "mongoose";

export class DbRebository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(
    data: Partial<T>,
  ): Promise<HydratedDocument<T> | HydratedDocument<T>[]> {
    return await this.model.create(data as any);
  }
  async find({
    filter,
    select,
    options,
  }: {
    filter: QueryFilter<T>;
    select?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | HydratedDocument<T>[]> {
    return await this.model.find(filter, select, options);
  }

  async findOne(
    filter: QueryFilter<T>,
    select?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findOne(filter, select, options);
  }
  async findById(
    id: string,
    select?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findById(id, select, options);
  }

  async findOneAndUpdate(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options: QueryOptions<T> | null = { new: true },
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findOneAndUpdate(filter, update, options);
  }
  async updateOne(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
  ): Promise<HydratedDocument<T> | UpdateWriteOpResult> {
    return await this.model.updateOne(filter, update);
  }
  async deleteOne(filter: QueryFilter<T>): Promise<DeleteResult> {
    return await this.model.deleteOne(filter);
  }
  async findOneAndDelete(
    filter: QueryFilter<T>,
  ): Promise<HydratedDocument<T> | null> {
    return await this.model.findOneAndDelete(filter);
  }
  async paginate({
    filter,
    select,
    options,
    query,
  }: {
    filter: QueryFilter<T>;
    query: { page?: number; limit?: number };
    select?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    let { page = 1, limit = 5 } = query as unknown as {
      page: number;
      limit: number;
    };

    if (page < 0) page = 1;
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
