import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anker Package Copy Generator",
  description: "製品情報からパッケージ用日本語文言を自動生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}



