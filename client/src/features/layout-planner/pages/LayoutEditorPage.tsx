import { useParams } from "react-router-dom";

export function LayoutEditorPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <header className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
        <span className="text-sm font-semibold text-white">3D Layout Editor</span>
        <span className="text-xs text-gray-400">Event ID: {id}</span>
      </header>
      <main className="flex flex-1">
        {/* ObjectLibraryPanel | Canvas3D | PropertiesPanel */}
        <div className="flex flex-1 items-center justify-center text-gray-500">
          3D Canvas will render here
        </div>
      </main>
    </div>
  );
}
