import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sangho's Interactive",
  description: "A premium showcase of interactive web experiments.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
