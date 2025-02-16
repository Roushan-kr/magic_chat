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
import { Message } from "@/models/User";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiRespoonse";
import { toast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import { X } from "lucide-react";


type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

function Messagecard({ message, onMessageDelete }: MessageCardProps) {
 async function handleDeleteConfirm(): Promise<void> {
    try {
      const res = await axios.delete<ApiResponse>(`/api/msg/`,{
        data:{
          messageid:message._id
        }
      })
        if(res.data.success){
          toast({
            title:"Message delated"
          })
        }
        onMessageDelete(message._id.toString())
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title:"unable to del Message",
        description:axiosError.response?.data.error || "Try after some time"
      })
    }
  }

  return (
    <Card className="card-bordered">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-sm">
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

export default Messagecard;
