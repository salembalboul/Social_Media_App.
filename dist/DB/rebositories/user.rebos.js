import UserModel from "../model/user.model.js";
import DbRebository from "./db.rebos.js";
import { appError } from "../../utils/classError.js";
export class UserRebository extends DbRebository {
    model;
    constructor(model) {
        super(UserModel);
        this.model = model;
    }
    async createOne(data) {
        const user = await this.model.create(data);
        if (!user) {
            throw new appError("user not found", 404);
        }
        return user;
    }
}
