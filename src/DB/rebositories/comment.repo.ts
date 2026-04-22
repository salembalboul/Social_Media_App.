import { Model } from "mongoose";
import DbRebository from "./db.rebos.js";
import { IComment } from "../model/comment.model.js";

export class CommentRebository extends DbRebository<IComment>{
    constructor(protected readonly model:Model<IComment>){
        super(model)
    }    

}   