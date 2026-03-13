import { useParams } from "react-router-dom";

export function VenueProfilePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Venue Profile</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Venue ID: {id}</p>
      {/* Photo gallery, amenities, availability, reviews, booking CTA */}
    </div>
  );
}
