import { useParams } from "react-router-dom";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Detail</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Event ID: {id}</p>
      {/* Event overview, quick stats, navigation to sub-pages */}
    </div>
  );
}
