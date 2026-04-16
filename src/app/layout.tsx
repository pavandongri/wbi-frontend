import Layout from "@/components/layout/Layout";
import type { Metadata } from "next";
import Providers from "./provider/page";

export const metadata: Metadata = {
  title: "WBI Chat App",
  description: "Premium messaging web app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
