"use client";
import Messagecard from "@/components/Messagecard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/models/Message";
import { acceptMsgSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiRespoonse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// using optemestic UI action forst displayed to usr then updated and action taken
function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handelDelMsg = (msgId: string) => {
    setMessages(messages.filter((msg) => (msg._id as string).toString() !== msgId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMsgSchema),
    defaultValues: {
      acceptMessage: false,
    },
  });

  // extracting value from form for manual trigers
  const { register, watch, setValue } = form;

  const acceptMessage = watch("acceptMessage");

  const fetchAcceptMsg = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const res = await axios.get<ApiResponse>("/api/msg/accept");
      if (!res.data.success) {
        toast({
          title: "accept message status",
          description: res.data?.message,
        });
      }
      setValue("acceptMessage", res.data.allowMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "accept message status",
        description: axiosError.response?.data.message || "Network Error",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchUserMsg = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(true);
      try {
        const res = await axios.get<ApiResponse>("/api/msg");
        if (!res.data.success) {
          toast({
            title: "unable to get Your Message",
            description: res.data?.message,
          });
        }
        setMessages(res.data.data.messages || []);
        if (refresh) {
          toast({
            title: "Message Refreshed",
            description: "New message List updated",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "User Message Status",
          description: axiosError.response?.data.message || "Network Error",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setMessages, setIsLoading]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMsg();
    fetchUserMsg();
  }, [session, setValue, fetchAcceptMsg, fetchUserMsg]);

  const handelSwitchChange = async () => {
    try {
      const res = await axios.post<ApiResponse>("/api/msg/accept", {
        allowMessages: !acceptMessage,
      });
      if (!res.data.success) {
        return toast({
          title: "unable to chage acceptMessage",
          description: res.data.message || "some error occur",
          variant: "destructive",
        });
      }
      setValue("acceptMessage", !acceptMessage);
      toast({
        title: res.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "unable to Togle",
        description: axiosError.response?.data.message || "Network Error",
        variant: "destructive",
      });
    }
  };

  if (!session || !session.user) {
    return <>Please Login to Proside</>;
  }
  const { username } = session.user;
  
  const profileUrl = new URL(`u/${username}`, window.location.origin).toString();
  const copyToClipboard = async () => {
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        toast({ title: "Text copied to clipboard successfully" });
      })
      .catch(() => {
        toast({ title: "Error copying text to clipboard" });
      });
  };
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessage")}
          checked={acceptMessage}
          onCheckedChange={handelSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchUserMsg(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Messagecard
            // issue for uknown
              key={message._id ? message._id.toString() : index}
              message={message}
              onMessageDelete={handelDelMsg}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
