import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Cohere CV Search",
    description: "Semantic CV search with AI embeddings",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="antialiased">{children}</body>
        </html>
    );
}