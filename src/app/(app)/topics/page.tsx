"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFormSchema, searchFormSchema } from "@/schemas/topicsShema";
import Link from "next/link";

type Topic = {
  _id: string;
  title: string;
  messages: string[];
  createdAt: string;
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form for creating a new topic
  const createForm = useForm({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      topicTitle: "",
    },
  });

  // Form for searching topics
  const searchForm = useForm({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  // Fetch topics
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/topics");
      const result = await response.json();
      if (result.success) {
        setTopics(result.data);
      } else {
        setError(result.message || "Failed to fetch topics");
      }
    } catch (err) {
      setError("An error occurred while fetching topics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Create a new topic
  const handleCreateTopic = async (data: { topicTitle: string }) => {
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: data.topicTitle }),
      });

      const result = await response.json();

      if (result.success) {
        createForm.reset();
        fetchTopics(); // Refresh the topics list
      } else {
        setError(result.message || "Failed to create topic");
      }
    } catch (err) {
      setError("An error occurred while creating the topic");
      console.error(err);
    }
  };

  // Delete a topic
  const handleDeleteTopic = async (topicId: string) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      try {
        const response = await fetch("/api/topics", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topicId }),
        });

        const result = await response.json();

        if (result.success) {
          fetchTopics(); // Refresh the topics list
        } else {
          setError(result.message || "Failed to delete topic");
        }
      } catch (err) {
        setError("An error occurred while deleting the topic");
        console.error(err);
      }
    }
  };

  // Search topics
  const handleSearch = (data: { searchTerm?: string }) => {
    if (!data.searchTerm) {
      fetchTopics();
      return;
    }

    // Add ESLint disable for intentional non-null assertion
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const filtered = topics.filter((topic) =>
      topic.title.toLowerCase().includes(data.searchTerm!.toLowerCase())
    );
    setTopics(filtered);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Topics</h1>

      {/* Create Topic Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Topic</h2>
        <form onSubmit={createForm.handleSubmit(handleCreateTopic)} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter topic title"
              {...createForm.register("topicTitle")}
              className="w-full px-4 py-2 border rounded-md"
            />
            {createForm.formState.errors.topicTitle && (
              <p className="text-red-500 text-sm mt-1">
                {createForm.formState.errors.topicTitle.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            disabled={createForm.formState.isSubmitting}
          >
            {createForm.formState.isSubmitting ? "Creating..." : "Create Topic"}
          </button>
        </form>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={searchForm.handleSubmit(handleSearch)} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search topics..."
              {...searchForm.register("searchTerm")}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              searchForm.reset();
              fetchTopics();
            }}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Topics List */}
      {loading ? (
        <div className="text-center py-8">Loading topics...</div>
      ) : topics.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p>No topics found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2">{topic.title}</h2>
                  <button
                    onClick={() => handleDeleteTopic(topic._id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete topic"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  Created: {formatDate(topic.createdAt)}
                </p>
                <p className="text-gray-700 mb-4">
                  {topic.messages.length} {topic.messages.length === 1 ? "message" : "messages"}
                </p>
                <Link
                  href={`/topics/${topic._id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Topic
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
