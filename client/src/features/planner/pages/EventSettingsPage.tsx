import { useParams } from "react-router-dom";

export function EventSettingsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Settings</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Event ID: {id}</p>
      {/* Event settings form, publish/unpublish, danger zone */}
    </div>
  );
}
