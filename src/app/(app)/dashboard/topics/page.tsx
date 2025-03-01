"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search } from "lucide-react";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { createFormSchema, searchFormSchema } from '@/schemas/topicsShema';

interface Topic {
  _id: string;
  title: string;
  messagesCount?: number;
}


function TopicsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Setup form handling with react-hook-form
  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      topicTitle: "",
    },
  });

  const searchTerm = searchForm.watch("searchTerm") || "";

  // Fetch all topics for the current user
  const fetchTopics = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/msg/acept');
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.topics || []);
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to fetch topics',
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: 'An error occurred while fetching topics',
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  // Handle topic creation
  const handleCreateTopic = async (data: z.infer<typeof createFormSchema>) => {
    if (!data.topicTitle.trim()) {
      return;
    }
    
    setIsCreating(true);
    try {
      const normalizedTopic = data.topicTitle.trim().toLowerCase();
      toast({
        title: "Topic created",
        description: `Created topic: ${data.topicTitle}`,
      });
      router.push(`/topics/${normalizedTopic}`);
    } catch (err) {
      toast({
        title: "Error",
        description: 'An error occurred while creating the topic',
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsCreating(false);
      createForm.reset();
    }
  };

  // Handle topic navigation via input form
  const handleGoToTopic = async (data: z.infer<typeof searchFormSchema>) => {
    if (data.searchTerm?.trim()) {
      router.push(`/topics/${data.searchTerm.trim().toLowerCase()}`);
    }
  };

  // Filter topics based on search term
  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchTopics();
    }
  }, [status, fetchTopics]);

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your topics</h1>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Your Topics</h1>

      {/* Search and Navigation Form */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="search-topics" className="text-sm font-medium">
            Find a Topic
          </label>
          <div className="relative">
            <Form {...searchForm}>
              <form onSubmit={searchForm.handleSubmit(handleGoToTopic)} className="flex items-center">
                <div className="relative flex-grow">
                  <FormField
                    control={searchForm.control}
                    name="searchTerm"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="search-topics"
                              placeholder="Search or enter topic name..." 
                              className="pl-8 pr-20 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="absolute right-1 top-1 h-8"
                  >
                    Go
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateTopic)} className="flex flex-col md:flex-row gap-2">
                <FormField
                  control={createForm.control}
                  name="topicTitle"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input 
                          placeholder="Create a new topic..." 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isCreating || !createForm.formState.isValid}
                  variant="default"
                >
                  {isCreating ? 'Creating...' : 'Create New Topic'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-pulse">Loading topics...</div>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-muted p-4 rounded-md">
          <span className="block sm:inline">
            {searchTerm ? 'No matching topics found.' : 'You don\'t have any topics yet. Create one to get started!'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <Card 
              key={topic._id}
              onClick={() => router.push(`/topics/${topic.title.toLowerCase()}`)}
              className="cursor-pointer hover:bg-accent/20 transition-colors"
            >
              <CardContent className="p-4">
                <h3 className="font-medium text-lg mb-1">{topic.title}</h3>
                {topic.messagesCount !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {topic.messagesCount} message{topic.messagesCount !== 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopicsPage;
