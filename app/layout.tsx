import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHỐT! — Để Internet chốt giùm bạn",
  description: "Mini game, vote cộng đồng và randomizer dành cho những quyết định tưởng nhỏ mà cãi cả ngày.",
  openGraph: {
    title: "CHỐT! — Để Internet chốt giùm bạn",
    description: "Bạn nghĩ vậy. Còn Internet thì sao?",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
