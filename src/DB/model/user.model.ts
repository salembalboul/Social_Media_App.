import mongoose from "mongoose";
import { Types } from "mongoose";

export enum GenderType {
  male = "male",
  female = "female",
}

export enum RoleType {
  user = "user",
  admin = "admin",
  superAdmin = "superAdmin",
}

export enum providerType {
  system = "system",
  google = "google",
}

export interface IUser {
  _id: Types.ObjectId;
  fName: string;
  lName: string;
  userName?: string;
  email: string;
  password: string;
  age: number;
  confirmed?: boolean;
  image?: string;
  coverImages: { secure_url: String; public_id: String }[];
  profileImage: { secure_url: String; public_id: String };
  tempProfileImage?: string;
  provider: providerType;
  phone: string;
  address: string;
  otp: string;
  changeCredentials?: Date;
  gender: GenderType;
  role?: RoleType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  restoredAt?: Date;
  restoredBy?: Types.ObjectId;
  friends?: Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
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
      required: function (): boolean {
        return this.provider === providerType.google ? false : true;
      },
    },
    age: {
      type: Number,
      required: function (): boolean {
        return this.provider === providerType.google ? false : true;
      },
      min: 18,
      max: 60,
    },

    gender: {
      type: String,
      required: function (): boolean {
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
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    strictQuery: true,
    toJSON: { virtuals: true },
  },
);

// userSchema.pre("save",async function(this:HydratedDocument<IUser> &{NEW:Boolean} ) {
// //======================================pre hooks========================================
// this.NEW = this.isNew;

// if(this.isModified("password")) {
// this.password= await Hash(this.password);}

//  });

//  userSchema.post("save",async function() {
// //======================================post hooks========================================
// const that = this as HydratedDocument<IUser> & { NEW?: boolean };
// if(that.NEW === true) {
//     const otp = await generateOtp();
//     eventEmitter.emit("confirmEmail",{email:this.email,otp});
// }

//  });

userSchema.pre(["findOne", "updateOne", "findOneAndUpdate"], async function () {
  const query = this.getQuery();
  const { paranoid, ...rest } = query;
  if (paranoid === false) {
    this.setQuery({ ...rest });
  } else {
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

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
