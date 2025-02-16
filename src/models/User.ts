import mongoose ,{Schema , Document, Types} from 'mongoose';

export interface Message extends Document {
    _id: Types.ObjectId;  // Explicitly adding _id
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export interface TopicMessage extends Document {
    _id: Types.ObjectId;  // Explicitly adding _id
    name:string,
    messages: [Message];
    createdAt: Date;
}

const TopicSchema: Schema<TopicMessage>= new Schema({
    name:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    messages:[MessageSchema],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

export interface User extends Document {
    _id: Types.ObjectId;  // Explicitly adding _id
    uname: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    isAcceptingMessage : boolean;
    messages: Message[];
    isVerified : boolean;
    topics?:TopicMessage[]
}

const UserSchema: Schema<User> = new Schema({
    uname: { type: String, required: [true,"userName is requied !!"], trim:true, unique:true },
    email: { type: String, required: true, unique: true , match:[/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,"Invalid email !!"]},
    password: { type: String, required: true },
    verifyCode: { type: String },
    verifyCodeExpires: { type: Date },
    isAcceptingMessage: { type: Boolean, default: true },
    messages: [MessageSchema],
    isVerified:{ type:Boolean, default:false},
    topics:[TopicSchema]
},{timestamps:true});

const userModel = mongoose.models.User  as mongoose.Model<User> || mongoose.model<User>('User', UserSchema);

export default userModel;


