"use client"
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiRespoonse";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

function verify() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const [isSubmiting, setIsSubmiting] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      verifyCode: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof verifySchema>) {
    setIsSubmiting(true);
    try {
      const res = await axios.get<ApiResponse>(
        `/api/auth/verify?uname=${params.username}&?code=${values.verifyCode}`
      );
      if (res.data?.success) {
        toast({
          title: "Your code verified",
          description: res.data.message || "Thanks for using us",
        });
        return await router.replace("/sign-in");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Unable to signup",
        description:
          axiosError.response?.data.message ??
          "Somting went wrong try again latter",
        variant: "destructive",
      });
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Verify Your Account
            </h1>
            <p className="mb-4">
              Enter the verification code sent to your email
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="verifyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmiting}>
                  {isSubmiting ? (
                    <>
                    <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                    Please Wait
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default verify;
