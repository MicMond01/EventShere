import { useParams } from "react-router-dom";

export function RatingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rate Fellow Guests</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Event ID: {eventId}</p>
      {/* RatingForm component */}
    </div>
  );
}
