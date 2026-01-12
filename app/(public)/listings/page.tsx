"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { useGetListingsQuery } from "@/store/api/listings.api";
import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { ListingCard } from "@/components/marketplace/ListingCard";

export default function ListingsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useGetListingsQuery({ q, page: 1 });

  return (
    <Container>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Listings</h1>
        <ListingFilters q={q} setQ={setQ} />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Card>
            <p className="text-sm text-gray-600">Loading listings...</p>
          </Card>
        ) : null}

        {error ? (
          <Card>
            <p className="text-sm text-red-600">
              Failed to load listings. Check backend + `NEXT_PUBLIC_API_URL`.
            </p>
          </Card>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items?.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Container>
  );
}
