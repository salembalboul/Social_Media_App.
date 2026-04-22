import DbRebository from "./db.rebos.js";
export class RevokeTokenRebository extends DbRebository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
//# sourceMappingURL=revokeToken.rebo.js.map