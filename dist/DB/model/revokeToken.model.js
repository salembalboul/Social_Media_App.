import mongoose from "mongoose";
import { Types } from "mongoose";
const RevokeTokenSchema = new mongoose.Schema({
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    tokenId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
const revokeTokenModel = mongoose.model("RevokeToken", RevokeTokenSchema);
export default revokeTokenModel;
//# sourceMappingURL=revokeToken.model.js.map