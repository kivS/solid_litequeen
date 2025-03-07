import { Inter } from "next/font/google";

import clsx from "clsx";
import Script from "next/script";
import { Providers } from "@/app/providers";

import "@/styles/tailwind.css";

import { TailwindIndicator } from "@/components/tailwind-indicator";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata = {
	title: "Solid Lite Queen - ",
	description:
		"Lite Queen is an open-source SQLite database management software that runs on your server.",
	alternates: {
		types: {
			"application/rss+xml": "https://solid.litequeen.com/feed.xml",
		},
	},
	metadataBase: new URL("https://solid.litequeen.com"),
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={clsx("h-full antialiased", inter.className)}
			suppressHydrationWarning
		>
			<body className="flex min-h-full flex-col bg-white dark:bg-gray-950">
				<Providers>
					{children}

					{/* {process.env.NODE_ENV === "production" && (
						<Script
							src="https://umami.arm.vikborges.com/script.js"
							data-website-id="ba1b7ef1-f76b-4be3-b44a-0372b83e9cf9"
							strategy="afterInteractive"
						/>
					)} */}
				</Providers>
				<TailwindIndicator />
			</body>
		</html>
	);
}
