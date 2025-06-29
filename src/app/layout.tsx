import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/plus-jakarta-sans";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/400.css";

export const metadata: Metadata = {
  title: "Factitious",
  description:
    "Explore the limits of your LLMs creativity. Is it fact or fiction?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
