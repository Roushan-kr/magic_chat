import mongoose ,{Schema , Document} from 'mongoose';

export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export interface User extends Document {
    uname: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    isAcceptingMessage : boolean;
    messages: Message[];
    isVerified : boolean;
}

const UserSchema: Schema<User> = new Schema({
    uname: { type: String, required: [true,"userName is requied !!"], trim:true, unique:true },
    email: { type: String, required: true, unique: true , match:[/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,"Invalid email !!"]},
    password: { type: String, required: true },
    verifyCode: { type: String },
    verifyCodeExpires: { type: Date },
    isAcceptingMessage: { type: Boolean, default: true },
    messages: [MessageSchema],
    isVerified:{ type:Boolean, default:false}
});

const userModel = mongoose.models.User  as mongoose.Model<User> || mongoose.model<User>('User', UserSchema);

export default userModel;


