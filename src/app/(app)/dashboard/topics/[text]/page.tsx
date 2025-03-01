"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from '@/hooks/use-toast';

// Define types for messages and API response
interface Message {
  _id: string;
  text: string;
  receiver: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalMessages: number;
  totalPages: number;
}

function TopicsPage() {
  const { text } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  
  const page = searchParams.get('page') || '1';
  
  // Normalize topic text (remove slashes for API request)
  const normalizeTopicText = useCallback((topicText: string | string[]): string => {
    if (!topicText) return '';
    const normalizedText = Array.isArray(topicText) ? topicText.join('') : topicText.replace(/\//g, '');
    return normalizedText.toLowerCase().trim();
  }, []);
  
  // Display-friendly topic text
  const displayTopicText = useCallback((topicText: string | string[]): string => {
    if (!topicText) return '';
    return Array.isArray(topicText) ? topicText.join('/') : topicText;
  }, []);
  
  const fetchMessages = useCallback(async () => {
    if (status !== "authenticated") return;
    
    setLoading(true);
    try {
      const normalizedTopic = normalizeTopicText(text);
      const response = await fetch(`/api/msg/accept/${normalizedTopic}?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
        setPagination(data.data || null);
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to fetch messages',
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: 'An error occurred while fetching messages',
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [text, page, status, toast, normalizeTopicText]);
  
  const deleteMessage = useCallback(async (messageId: string) => {
    if (status !== "authenticated") return;
    
    try {
      const response = await fetch(`/api/msg/accept/${normalizeTopicText(text)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted message from the list
        setMessages((prevMessages) => prevMessages.filter(message => message._id !== messageId));
        
        toast({
          title: "Message deleted",
          description: "The message has been successfully deleted"
        });
        
        // Refetch if needed to update pagination
        if (messages.length === 1 && pagination && pagination.page > 1) {
          router.push(`/topics/${text}?page=${pagination.page - 1}`);
        } else {
          fetchMessages();
        }
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to delete message',
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: 'An error occurred while deleting the message',
        variant: "destructive"
      });
      console.error(err);
    }
  }, [fetchMessages, messages.length, normalizeTopicText, pagination, router, status, text, toast]);
  
  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, fetchMessages]);
  
  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your messages</h1>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">
        Messages for topic: {displayTopicText(text)}
      </h1>
      
      {loading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[80px] w-full rounded-md" />
          <Skeleton className="h-[80px] w-full rounded-md" />
          <Skeleton className="h-[80px] w-full rounded-md" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-muted p-4 rounded-md">
          <p>No messages found for this topic.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message._id}>
                <CardContent className="pt-6">
                  <p>{message.text}</p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                  <Button 
                    onClick={() => deleteMessage(message._id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                {pagination.page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`/topics/${text}?page=${pagination.page - 1}`} />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationLink>
                    Page {pagination.page} of {pagination.totalPages}
                  </PaginationLink>
                </PaginationItem>
                
                {pagination.page < pagination.totalPages && (
                  <PaginationItem>
                    <PaginationNext href={`/topics/${text}?page=${Number(pagination.page) + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}

export default TopicsPage;