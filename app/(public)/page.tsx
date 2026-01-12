import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <Container>
      <Card title="Greenhouse Marketplace">
        <p className="text-sm text-gray-600">
          Browse products, services, jobs, and buy requests in the greenhouse industry.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/listings">
            <Button>Browse Listings</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}
