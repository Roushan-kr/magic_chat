import mongoose, { Model, Schema, } from "mongoose";

export interface Message extends Document {
  text: string;
  createdAt: Date;
  resiver: Schema.Types.ObjectId; // Reference to User
}

const MessageSchema = new Schema<Message>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const MessageModel: Model<Message> =
  mongoose.models.Message || mongoose.model<Message>("Message", MessageSchema);

export default MessageModel;
