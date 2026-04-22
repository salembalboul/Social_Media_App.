import { Model } from "mongoose";
import DbRebository from "./db.rebos.js";
import { Ichat } from "../model/chat.model.js";

export class ChatRebository extends DbRebository<Ichat>{
    constructor(protected readonly model:Model<Ichat>){
        super(model)
    }    

}   