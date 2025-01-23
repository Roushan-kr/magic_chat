import { Message } from "@/models/User";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    data?: any;
    error?: any;
    messages ?:Array<Message>;
}