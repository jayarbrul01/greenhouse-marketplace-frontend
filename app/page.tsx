"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <Container>
      <Card title={t("appName")}>
        <p className="text-sm text-gray-900">
          Browse products, services, jobs, and buy requests in the greenhouse industry.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/listings">
            <Button>{t("browseListings")}</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">{t("login")}</Button>
          </Link>
          <Link href="/signup">
            <Button>{t("signUp")}</Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}
