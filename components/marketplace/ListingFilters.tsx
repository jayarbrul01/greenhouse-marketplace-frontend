"use client";

import { Input } from "@/components/ui/Input";

export function ListingFilters({
  q,
  setQ,
}: {
  q: string;
  setQ: (v: string) => void;
}) {
  return (
    <div className="w-full max-w-sm">
      <Input placeholder="Search listings..." value={q} onChange={(e) => setQ(e.target.value)} />
    </div>
  );
}
