import mongoose, { Schema, Model, Types } from "mongoose";

// Topic Interface (Infer from Schema)
export interface Topic {
  title: string;
  messages: Types.ObjectId[]; // References to Message collection
  createdAt: Date;
}

// Topic Schema
const TopicSchema = new Schema<Topic>(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }], // Reference to messages
  },
  { timestamps: true }
);

const TopicModel: Model<Topic> =
  mongoose.models.Topic || mongoose.model<Topic>("Topic", TopicSchema);

export default TopicModel;
