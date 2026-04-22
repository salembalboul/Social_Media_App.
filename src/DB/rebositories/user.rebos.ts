import { HydratedDocument, Model } from "mongoose";
import UserModel,{ IUser } from "../model/user.model.js";
import DbRebository from "./db.rebos.js";
import { appError } from "../../utils/classError.js";

    

export class UserRebository extends DbRebository<IUser>{
    constructor(protected readonly model:Model<IUser>){
        super(model)
    }

    async createOne(data:Partial<IUser>):Promise <HydratedDocument<IUser> | HydratedDocument<IUser>[] >{
        const user: HydratedDocument<IUser> | HydratedDocument<IUser>[] = await this.model.create(data as any)
        
        if(!user){ throw new appError("user not found",404) }
         return user
      }
      

}   