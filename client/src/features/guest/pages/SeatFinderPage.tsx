import { useParams } from "react-router-dom";

export function SeatFinderPage() {
  const { eventId } = useParams<{ eventId: string }>();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seat Finder</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Event ID: {eventId}</p>
      {/* SeatMap3D component */}
    </div>
  );
}
