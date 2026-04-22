import mongoose from "mongoose";
import { Types } from "mongoose";
export var GenderType;
(function (GenderType) {
    GenderType["male"] = "male";
    GenderType["female"] = "female";
})(GenderType || (GenderType = {}));
export var RoleType;
(function (RoleType) {
    RoleType["user"] = "user";
    RoleType["admin"] = "admin";
    RoleType["superAdmin"] = "superAdmin";
})(RoleType || (RoleType = {}));
export var providerType;
(function (providerType) {
    providerType["system"] = "system";
    providerType["google"] = "google";
})(providerType || (providerType = {}));
const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 10,
        trim: true,
    },
    lName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 10,
        trim: true,
    },
    email: { type: String, required: true, unique: true, trim: true },
    password: {
        type: String,
        required: function () {
            return this.provider === providerType.google ? false : true;
        },
    },
    age: {
        type: Number,
        required: function () {
            return this.provider === providerType.google ? false : true;
        },
        min: 18,
        max: 60,
    },
    gender: {
        type: String,
        required: function () {
            return this.provider === providerType.google ? false : true;
        },
        enum: GenderType,
    },
    address: { type: String },
    tempProfileImage: { type: String },
    provider: {
        type: String,
        enum: providerType,
        default: providerType.system,
    },
    image: { type: String },
    profileImage: { secure_url: String, public_id: String },
    coverImages: [{ secure_url: String, public_id: String }],
    otp: { type: String },
    phone: { type: String },
    friends: [{ type: Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: Types.ObjectId, ref: "User" },
    confirmed: { type: Boolean },
    changeCredentials: { type: Date },
    role: { type: String, enum: RoleType, default: RoleType.user },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    strictQuery: true,
    toJSON: { virtuals: true },
});
userSchema.pre(["findOne", "updateOne", "findOneAndUpdate"], async function () {
    const query = this.getQuery();
    const { paranoid, ...rest } = query;
    if (paranoid === false) {
        this.setQuery({ ...rest });
    }
    else {
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    }
});
userSchema
    .virtual("userName")
    .set(function (value) {
    const [fName, lName] = value.split(" ");
    this.set({ fName, lName });
})
    .get(function () {
    return `${this.fName} ${this.lName}`;
});
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
//# sourceMappingURL=user.model.js.map