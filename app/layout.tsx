import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peta Dinamis - Bulusidokare",
  description: "Peta Dinamis - Bulusidokare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
