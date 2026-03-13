import { useParams } from "react-router-dom";

export function EventPublicPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Details</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Event: {slug}</p>
      {/* Event cover, description, registration CTA */}
    </div>
  );
}
