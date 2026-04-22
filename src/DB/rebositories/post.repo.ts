import { Model } from "mongoose";
import DbRebository from "./db.rebos.js";
import { IPost } from "../model/post.model.js";

    

export class PostRebository extends DbRebository<IPost>{
    constructor(protected readonly model:Model<IPost>){
        super(model)
    }    

}   