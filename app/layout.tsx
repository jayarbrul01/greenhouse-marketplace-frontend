import "./globals.css";
import Providers from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Greenhouse Marketplace",
  description: "Marketplace for greenhouse industry",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen text-gray-100 flex flex-col" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="py-4 sm:py-6 md:py-8 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
