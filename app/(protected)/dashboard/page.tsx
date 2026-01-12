"use client";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  return (
    <Container>
      <Card title="Dashboard">
        {isAuthenticated ? (
          <p className="text-sm text-gray-700">
            Logged in as <span className="font-semibold">{user?.email ?? "Unknown"}</span>
          </p>
        ) : (
          <p className="text-sm text-red-600">Not authenticated. Redirecting…</p>
        )}
      </Card>
    </Container>
  );
}
