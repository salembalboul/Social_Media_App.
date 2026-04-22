import { Model } from "mongoose";
import DbRebository from "./db.rebos.js";
import { IFriendRequest } from "../model/friendRequest.model.js";

export class FriendRequestRebository extends DbRebository<IFriendRequest>{
    constructor(protected readonly model:Model<IFriendRequest>){
        super(model)
    }    

}   