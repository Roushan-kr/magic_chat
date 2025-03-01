"use client";
import Head from "next/head";
import { Loader2, RefreshCcw, MessageCircle, Link as LinkIcon, MessageSquare, Copy, CheckCircle } from "lucide-react";
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
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

// using optemestic UI action forst displayed to usr then updated and action taken

function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAcceptToggling, setIsAcceptToggling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handelDelMsg = (msgId: string) => {
    setMessages(
      messages.filter((msg) => (msg._id as string).toString() !== msgId)
    );
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
          title: "Message acceptance status",
          description: res.data?.message,
        });
      }
      setValue("acceptMessage", res.data.allowMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Status check failed",
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
    setIsAcceptToggling(true);
    try {
      const res = await axios.post<ApiResponse>("/api/msg/accept", {
        allowMessages: !acceptMessage,
      });
      if (!res.data.success) {
        return toast({
          title: "Failed to update settings",
          description: res.data.message || "Please try again",
          variant: "destructive",
        });
      }
      setValue("acceptMessage", !acceptMessage);
      toast({
        title: "Settings updated",
        description: `Messages are now ${!acceptMessage ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Update failed",
        description: axiosError.response?.data.message || "Network Error",
        variant: "destructive",
      });
    } finally {
      setIsAcceptToggling(false);
    }
  };

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-8">
        <div className="text-center p-8 bg-gray-50 rounded-lg border shadow-sm max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-4 text-gray-600">Please login to access your dashboard</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/sign-in">Login to continue</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Safely access username from session
  const username = session.user.username as string;
  if (!username) {
    return <div className="p-4 text-center">User profile not found</div>;
  }

  const profileUrl = new URL(
    `u/${username}`,
    window.location.origin
  ).toString();

  const copyToClipboard = async () => {
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => {
        setIsCopied(true);
        toast({ 
          title: "Link copied!",
          description: "Share it with people who want to send you anonymous feedback"
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast({ 
          title: "Copy failed",
          description: "Please try again",
          variant: "destructive"
        });
      });
  };

  return (
    <>
      <Head>
        <title>Dashboard - Anonymous Feedback</title>
        <meta name="description" content="Manage your anonymous messages and feedback settings" />
      </Head>
      
      <TooltipProvider>
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded-lg shadow-md w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Dashboard</h1>
            <p className="text-gray-500">Manage messages and account settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Message Settings Card */}
            <div className="p-6 border rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                <MessageCircle className="mr-2 h-5 w-5" />
                Message Settings
              </h2>
              <p className="text-sm text-gray-600 mb-5">Control whether others can send you anonymous messages</p>
              
              <div className="flex items-center space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Switch
                      {...register("acceptMessage")}
                      checked={acceptMessage}
                      onCheckedChange={handelSwitchChange}
                      disabled={isSwitchLoading || isAcceptToggling}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {acceptMessage ? "Click to disable messages" : "Click to enable messages"}
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm border">
                  {isAcceptToggling ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                  ) : (
                    <div className={`h-2 w-2 rounded-full mr-2 ${acceptMessage ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  )}
                  <span className={`font-medium ${acceptMessage ? 'text-green-600' : 'text-red-600'}`}>
                    {acceptMessage ? "Accepting messages" : "Not accepting messages"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Link Card */}
            <div className="p-6 border rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                <LinkIcon className="mr-2 h-5 w-5" />
                Your Profile Link
              </h2>
              <p className="text-sm text-gray-600 mb-5">Share this link with others so they can send you messages</p>
              
              <div className="group flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={profileUrl}
                    readOnly
                    className="w-full p-3 pr-10 border rounded-md bg-white text-sm shadow-inner focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  />
                </div>
                <Button 
                  onClick={copyToClipboard} 
                  className={`w-full sm:w-auto transition-all duration-300 ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />
          
          {/* Messages Section */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center text-gray-800 mb-4 sm:mb-0">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                Your Messages
              </h2>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  fetchUserMsg(true);
                }}
                size="sm"
                className="flex items-center gap-2 border-blue-200 hover:bg-blue-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Loading messages...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 text-blue-600" />
                    <span>Refresh messages</span>
                  </>
                )}
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-48"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <Messagecard
                      key={message._id ? message._id.toString() : index}
                      message={message}
                      onMessageDelete={handelDelMsg}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                    {acceptMessage ? (
                      <p className="text-sm text-gray-500 mb-4">Share your profile link to start receiving anonymous feedback.</p>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">Enable Accept messages above to start receiving messages.</p>
                    )}
                    {acceptMessage && (
                      <Button 
                        variant="outline" 
                        onClick={copyToClipboard} 
                        className="mt-2"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy your link
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}

export default Page;
