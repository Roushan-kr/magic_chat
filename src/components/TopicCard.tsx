import Link from "next/link";
import { useState } from "react";

type TopicCardProps = {
  id: string;
  title: string;
  messagesCount: number;
  createdAt: string;
  onDelete: (id: string) => void;
};

export default function TopicCard({
  id,
  title,
  messagesCount,
  createdAt,
  onDelete,
}: TopicCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this topic?")) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete topic"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Created: {formatDate(createdAt)}
        </p>
        <p className="text-gray-700 mb-4">
          {messagesCount} {messagesCount === 1 ? "message" : "messages"}
        </p>
        <Link
          href={`/topics/${id}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          View Topic
        </Link>
      </div>
    </div>
  );
}
