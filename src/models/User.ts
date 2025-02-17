import mongoose, { Schema, Model, Types, Document } from "mongoose";
import bcrypt from "bcrypt";

// User Interface
export interface User extends Document {
  uname: string;
  email: string;
  password: string;
  verifyCode?: string;
  verifyExpires?: Date;
  allowMessages: boolean;
  messages: Types.ObjectId[]; // References to Message collection
  verified: boolean;
  topics: Types.ObjectId[]; // References to Topic collection
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const UserSchema = new Schema<User>(
  {
    uname: {
      type: String,
      required: [true, "Username is required!"],
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid email format!"],
      index: true,
    },
    password: { type: String, required: true },
    verifyCode: { type: String },
    verifyExpires: { type: Date },
    allowMessages: { type: Boolean, default: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }], // Reference to messages
    verified: { type: Boolean, default: false },
    topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }], // Reference to topics
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<User>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
