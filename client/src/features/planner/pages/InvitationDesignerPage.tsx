import { useParams } from "react-router-dom";

export function InvitationDesignerPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invitation Designer</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Event ID: {id}</p>
      {/* Template gallery, InvitationPreview, send controls */}
    </div>
  );
}
