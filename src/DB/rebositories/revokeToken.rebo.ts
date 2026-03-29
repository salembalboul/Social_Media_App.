import { Model } from "mongoose";
import DbRebository from "./db.rebos.js";
import { IRevokeToken } from "../model/revokeToken.model.js";

export class RevokeTokenRebository extends DbRebository<IRevokeToken>{
    constructor(protected readonly model:Model<IRevokeToken>){
        super(model)
    }
}   