import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Message } from "@/models/Message";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiRespoonse";
import { toast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import { X } from "lucide-react";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  async function handleDeleteConfirm(): Promise<void> {
    try {
      const res = await axios.delete<ApiResponse>(`/api/msg/`, {
        data: {
          messageId: message._id
        }
      });
      
      if(res.data.success) {
        toast({
          title: "Message deleted successfully",
          description: "The message has been permanently removed",
        });
        onMessageDelete((message._id as string).toString());
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error deleting message",
        description: axiosError.response?.data.error || "An error occurred while deleting the message. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="message-card relative hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            <h2 className="text-lg font-semibold break-words" role="heading">
              {message.text}
            </h2>
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                aria-label="Delete message"
                className="hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Are you sure you want to delete this message? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-gray-100">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteConfirm}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <time 
          dateTime={message.createdAt.toString()} 
          className="text-sm text-gray-500"
        >
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </time>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-gray-700 break-words">
          {message.text}
        </p>
      </CardContent>
    </Card>
  );
}

export default MessageCard;
