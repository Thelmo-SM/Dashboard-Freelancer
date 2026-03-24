import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Administración SM",
  description: "Administración de la empresa Thelmo SM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="">{children}</main>
      </body>
    </html>
  );
}
