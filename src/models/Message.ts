import mongoose, { Model, Schema, Document, Types } from "mongoose";

export interface Message extends Document {
  text: string;
  createdAt: Date;
  receiver: Types.ObjectId; // Reference to User
}

const MessageSchema = new Schema<Message>({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const MessageModel: Model<Message> =
  mongoose.models.Message || mongoose.model<Message>("Message", MessageSchema);

export default MessageModel;
