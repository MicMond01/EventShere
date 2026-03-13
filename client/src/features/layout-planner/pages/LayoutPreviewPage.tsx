import { useParams } from "react-router-dom";

export function LayoutPreviewPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <header className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
        <span className="text-sm font-semibold text-white">Layout Preview</span>
        <span className="text-xs text-gray-400">Event ID: {id}</span>
      </header>
      <main className="flex flex-1 items-center justify-center text-gray-500">
        Read-only 3D preview will render here
      </main>
    </div>
  );
}
