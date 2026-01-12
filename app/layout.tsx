import "./globals.css";
import Providers from "./providers";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Greenhouse Marketplace",
  description: "Marketplace for greenhouse industry",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="modern-bg min-h-screen text-gray-900" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
