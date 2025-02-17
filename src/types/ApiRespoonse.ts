import { Message } from "@/models/Message";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    data?: any;
    error?: any;
    messages ?:Array<Message>;
}