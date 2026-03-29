"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenType = exports.RoleType = exports.GenderType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var GenderType;
(function (GenderType) {
    GenderType["male"] = "male";
    GenderType["female"] = "female";
})(GenderType || (exports.GenderType = GenderType = {}));
var RoleType;
(function (RoleType) {
    RoleType["user"] = "user";
    RoleType["admin"] = "admin";
})(RoleType || (exports.RoleType = RoleType = {}));
var tokenType;
(function (tokenType) {
    tokenType["access"] = "access";
    tokenType["refresh"] = "refresh";
})(tokenType || (exports.tokenType = tokenType = {}));
const userSchema = new mongoose_1.default.Schema({
    fName: { type: String, required: true, minLength: 2, maxLength: 10, trim: true },
    lName: { type: String, required: true, minLength: 2, maxLength: 10, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    address: { type: String },
    otp: { type: String },
    phone: { type: String },
    confirmed: { type: Boolean },
    changeCredentials: { type: Date },
    age: { type: Number, required: true, min: 18, max: 60 },
    gender: { type: String, required: true, enum: GenderType },
    role: { type: String, required: true, enum: RoleType, default: RoleType.user },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
userSchema.virtual("userName").set(function (value) {
    const [fName, lName] = value.split(" ");
    this.set({ fName, lName });
}).get(function () {
    return `${this.fName} ${this.lName}`;
});
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
