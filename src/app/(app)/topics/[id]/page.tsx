"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Message = {
  _id: string;
  text: string;
  createdAt: string;
  receiver: string;
};

type Topic = {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

export default function TopicPage() {
  const params = useParams();
  // Ensure id is properly typed
  const id = params?.id as string;
  const { data: session } = useSession();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch topic data with useCallback to avoid dependency issues
  const fetchTopic = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/topics/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setTopic(result.data);
      } else {
        setError(result.message || "Failed to fetch topic");
      }
    } catch (err) {
      setError("An error occurred while fetching the topic");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Use effect with proper dependencies
  useEffect(() => {
    if (id) {
      fetchTopic();
    }
  }, [fetchTopic, id]);

  // Add a new message
  const handleAddMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          sender: session?.user?.name || "Anonymous",
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNewMessage("");
        fetchTopic(); // Refresh the topic to get the new message
      } else {
        setError(result.message || "Failed to add message");
      }
    } catch (err) {
      setError("An error occurred while sending the message");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a message (only for authenticated users)
  const handleDeleteMessage = async (messageId: string) => {
    if (!session?.user) {
      setError("You must be signed in to delete messages");
      return;
    }
    
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(`/api/topics/${id}?messageId=${messageId}`, {
          method: "DELETE",
        });

        const result = await response.json();
        
        if (result.success) {
          fetchTopic(); // Refresh the topic
        } else {
          setError(result.message || "Failed to delete message");
        }
      } catch (err) {
        setError("An error occurred while deleting the message");
        console.error(err);
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading topic...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/topics" className="text-blue-600 hover:underline">
          Back to Topics
        </Link>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Topic not found
        </div>
        <Link href="/topics" className="text-blue-600 hover:underline">
          Back to Topics
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/topics" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Topics
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
        <p className="text-gray-500 mb-4">Created: {formatDate(topic.createdAt)}</p>
      </div>

      {/* Message Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add a Message</h2>
        <form onSubmit={handleAddMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full px-4 py-2 border rounded-md resize-none h-24 mb-4"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        {topic.messages.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No messages yet. Be the first to add one!</p>
        ) : (
          <div className="space-y-4">
            {topic.messages.map((message) => (
              <div key={message._id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <p className="text-gray-700 whitespace-pre-line">{message.text}</p>
                  {session?.user && (
                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                      aria-label="Delete message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {formatDate(message.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
