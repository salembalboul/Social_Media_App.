import mongoose from "mongoose";
export var GenderType;
(function (GenderType) {
    GenderType["male"] = "male";
    GenderType["female"] = "female";
})(GenderType || (GenderType = {}));
export var RoleType;
(function (RoleType) {
    RoleType["user"] = "user";
    RoleType["admin"] = "admin";
})(RoleType || (RoleType = {}));
export var tokenType;
(function (tokenType) {
    tokenType["access"] = "access";
    tokenType["refresh"] = "refresh";
})(tokenType || (tokenType = {}));
export var providerType;
(function (providerType) {
    providerType["system"] = "system";
    providerType["google"] = "google";
})(providerType || (providerType = {}));
const userSchema = new mongoose.Schema({
    fName: { type: String, required: true, minLength: 2, maxLength: 10, trim: true },
    lName: { type: String, required: true, minLength: 2, maxLength: 10, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: function () {
            return this.provider === providerType.google ? false : true;
        } },
    age: { type: Number, required: function () {
            return this.provider === providerType.google ? false : true;
        }, min: 18, max: 60 },
    gender: { type: String, required: function () {
            return this.provider === providerType.google ? false : true;
        }, enum: GenderType },
    address: { type: String },
    provider: { type: String, enum: providerType, default: providerType.system },
    image: { type: String },
    otp: { type: String },
    phone: { type: String },
    deletedAt: { type: Date },
    confirmed: { type: Boolean },
    changeCredentials: { type: Date },
    role: { type: String, required: true, enum: RoleType, default: RoleType.user },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    strictQuery: true,
    toJSON: { virtuals: true },
});
userSchema.pre(["findOne", "updateOne"], async function () {
    console.log({ this: this, query: this.getQuery() });
    const query = this.getQuery();
    const { paranoid, ...rest } = query;
    if (paranoid === false) {
        this.setQuery({ ...rest });
    }
    else {
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    }
});
userSchema.virtual("userName").set(function (value) {
    const [fName, lName] = value.split(" ");
    this.set({ fName, lName });
}).get(function () {
    return `${this.fName} ${this.lName}`;
});
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
