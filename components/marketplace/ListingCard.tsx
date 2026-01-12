import { Listing } from "@/store/api/listings.api";

export function ListingCard({ item }: { item: Listing }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{item.type}</div>
      <div className="mt-1 font-semibold">{item.title}</div>
      <div className="mt-2 text-sm text-gray-600">
        {item.region ?? "—"} •{" "}
        {item.price != null ? `${item.price} ${item.currency ?? ""}` : "No price"}
      </div>
    </div>
  );
}
