import { Listing } from "@/store/api/listings.api";
import { Card } from "@/components/ui/Card";

export function ListingCard({ item }: { item: Listing }) {
  return (
    <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
      <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">{item.type}</div>
      <h3 className="mt-2 text-base sm:text-lg lg:text-xl font-semibold text-gray-900 line-clamp-2">
        {item.title}
      </h3>
      {item.category && (
        <div className="mt-3">
          <span className="inline-block px-2.5 py-1.5 text-xs sm:text-sm bg-green-100 text-green-800 rounded-full font-medium">
            {item.category}
          </span>
        </div>
      )}
      <div className="mt-4 text-sm sm:text-base text-gray-600 flex items-center gap-2 flex-wrap">
        {item.region && (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.region}
          </span>
        )}
        {item.price != null && (
          <span className="flex items-center gap-1.5 font-semibold text-green-700">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {item.price} {item.currency || "USD"}
          </span>
        )}
      </div>
    </Card>
  );
}
