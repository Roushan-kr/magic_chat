"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"; // imports entire as namespace "z"
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiRespoonse";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function SignIn() {
  const [userName, setUserName] = useState("");
  const [userNamemsg, setUserNamemsg] = useState("");
  const [checkValidUName, setCheckValidUName] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const debounce = useDebounceCallback(setUserName, 300);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUniqUName = async () => {
      if (userName) {
        setCheckValidUName(true);
        setUserNamemsg("");
        try {
          const res = await axios.get(
            `/api/auth/cuiq-uname?uname=${userName}`
          );
          setUserNamemsg(res.data?.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUserNamemsg(
            axiosError.response?.data?.message ?? " Error checking username "
          );
        } finally {
          setCheckValidUName(false);
        }
      }
    };
    checkUniqUName();
  }, [userName]);

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setIsSubmiting(true);
    try {
      const res = await axios.post<ApiResponse>("/api/auth/signup", values);
      if (res.data.success) {
        toast({
          title: "successfully signup",
          description: res.data.message || "User registed successfuly now verify your mail",
        });
        router.replace(`/verify/${userName}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Unable to signup",
        description: axiosError.response?.data.message ?? "Somting went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Feedback ana
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounce(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription hidden={true} >Enter your username.</FormDescription>
                  {
                    checkValidUName && <Loader2 className="animate-spin text-sm text-right"/> 
                  }
                  {!checkValidUName && userNamemsg && (
                    <p
                      className={`text-sm ${
                        userNamemsg === 'Username is abhilable'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {userNamemsg}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
              
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormDescription hidden={true}>Enter your email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"   
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passowrd</FormLabel>
                  <FormControl>
                    <Input placeholder="Passowrd" type="password" {...field} />
                  </FormControl>
                  <FormDescription hidden={true}>Enter your Password.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmiting}>
                {
                    isSubmiting?(
                        <>
                        <Loader2 className="mr-2 h-5 w-4 animate-spin"/>Please wait </>
                    ): "Signup"
                }
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
