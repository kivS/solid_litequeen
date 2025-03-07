export default function robots() {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/"],
				// disallow: [""],
			},
		],
		sitemap: "https://solid.litequeen.com/sitemap.xml",
	};
}
