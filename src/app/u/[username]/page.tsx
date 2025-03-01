"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { msgSchema } from "@/schemas/messageSchema";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import { useDebounceValue, useDebounceCallback } from "usehooks-ts";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiRespoonse";
import { useCompletion } from "ai/react";
import { useParams } from "next/navigation";

function Page() {
  const [suggestMsg, setSuggestMsg] = useState<string[]>([]);
  const [isMsgSentLoading, setIsMsgSentLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  const params = useParams();
  const username = (params.username as string) || "testuser";

  const form = useForm<z.infer<typeof msgSchema>>({
    resolver: zodResolver(msgSchema),
    defaultValues: { content: "", username },
  });

  const { watch, setValue, handleSubmit } = form;
  const userMsgContent = watch("content");

  function extractCSV(text: string) {
    return text.match(/[\w\s]+(?:,[\w\s]+)*/g)?.[0] || "";
  }

  const { complete, setInput, handleInputChange } = useCompletion({
    api: "/api/suggest",
    onResponse: (res) => {
      if (res.status === 429) {
        toast({ title: "Limit Exceeded", description: "Try again later." });
      }
    },
    onFinish: (_, completion) => {
      if (!completion) {
        setSuggestMsg(["No suggestions available"]);
        return;
      }

      try {
        const messages = completion
          .split("||")
          .flatMap((msg) => extractCSV(msg.trim()));
        setSuggestMsg(messages);
      } catch (error) {
        console.error("Error processing suggestions:", error);
        setSuggestMsg(["Error processing suggestions"]);
      }
    },
    onError: () => setSuggestMsg(["Error generating suggestions"]),
  });

  const [debouncedContent] = useDebounceValue(userMsgContent, 500);

  const debouncedFetch = useDebounceCallback(() => {
    if (debouncedContent.trim()) {
      complete(debouncedContent);
    }
  }, 500);

  useEffect(() => {
    debouncedFetch();
  }, [debouncedContent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && selectedSuggestion !== null) {
        e.preventDefault();
        const newValue = `${userMsgContent} ${suggestMsg[selectedSuggestion]}`.trim();
        setValue("content", newValue);
        setInput(newValue);
        setSelectedSuggestion(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedSuggestion, suggestMsg, userMsgContent]);

  async function onSubmit(data: z.infer<typeof msgSchema>) {
    setIsMsgSentLoading(true);
    console.log("Submitting data:", data);

    try {
      const response = await axios.post<ApiResponse>("/api/msg", {
        username,
        content: data.content,
      });

      if (response.data.success) {
        toast({
          title: `Message Sent to ${username}`,
          description: response.data.message,
        });
        setValue("content", "");
        setInput("");
        setSuggestMsg([]);
      }
    } catch (error) {
      const axiosErr = error as AxiosError<ApiResponse>;
      console.error("Error submitting message:", axiosErr.response?.data);

      toast({
        title: "Unable to Send Message",
        description: axiosErr.response?.data.message || "Something went wrong",
      });
    } finally {
      setIsMsgSentLoading(false);
    }
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Message</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Let&apos;s Chat With {username.toUpperCase()}
        </h2>
        <div className="flex flex-col space-y-4">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Write your message here</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your message..."
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(e);
                          setInput(value);
                          handleInputChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isMsgSentLoading}>
                {isMsgSentLoading ? "Sending..." : "Submit"}
              </Button>
            </form>
          </Form>

          {suggestMsg.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-md font-semibold mb-2">Suggestions:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestMsg.map((msg, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
                      selectedSuggestion === index
                        ? "bg-blue-500 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                    onClick={() => {
                      const newValue = `${userMsgContent} ${msg}`.trim();
                      setValue("content", newValue);
                      setInput(newValue);
                      setSelectedSuggestion(null);
                    }}
                    onMouseEnter={() => setSelectedSuggestion(index)}
                    onMouseLeave={() => setSelectedSuggestion(null)}
                  >
                    {msg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
