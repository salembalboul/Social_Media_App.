import { HydratedDocument, ProjectionType, QueryFilter, UpdateQuery } from "mongoose";
import { Model } from "mongoose";
import { UpdateWriteOpResult } from "mongoose";


export class DbRebository<T> {
    
    constructor(protected readonly model:Model<T>){}

async create(data:Partial<T>):Promise <HydratedDocument<T> | HydratedDocument<T>[]>{
    return await this.model.create(data as any)
}

async findOne(filter:QueryFilter<T>,select?:ProjectionType<T>):Promise <HydratedDocument<T> | null>{
  return await this.model.findOne(filter,select)
}
async updateOne(filter:QueryFilter<T>,update:UpdateQuery<T>):Promise <HydratedDocument<T> | UpdateWriteOpResult>{
  return await this.model.updateOne(filter,update)
}

} 

export default DbRebository