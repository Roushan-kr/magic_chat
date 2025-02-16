import mongoose, { Schema, Document, Types, Model } from "mongoose";
import bcrypt from "bcrypt";

// Message Schema
export interface Message extends Document {
  _id: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<Message>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

//  Topic Schema
export interface Topic extends Document {
  _id: Types.ObjectId;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const TopicSchema = new Schema<Topic>({
  title: { type: String, required: true, lowercase: true, trim: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

//  User Schema
export interface User extends Document {
  _id: Types.ObjectId;
  uname: string;
  email: string;
  password: string;
  verifyCode?: string;
  verifyExpires?: Date;
  allowMessages: boolean;
  messages: Message[];
  verified: boolean;
  topics?: Topic[];
}

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
      required: true,
      unique: true,
      match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid email!"],
      index: true, 
    },
    password: { type: String, required: true },
    verifyCode: { type: String },
    verifyExpires: { type: Date },
    allowMessages: { type: Boolean, default: true },
    messages: [MessageSchema],
    verified: { type: Boolean, default: false },
    topics: [TopicSchema],
  },
  { timestamps: true }
);

UserSchema.pre<User>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); 
  }
  next();
});

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;
