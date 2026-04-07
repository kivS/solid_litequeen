const THEME_STORAGE_KEY = "theme";
const THEME_ORDER = ["light", "dark", "system"];

function resolveTheme(theme) {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	return theme;
}

function applyTheme(theme) {
	const root = document.documentElement;
	const resolvedTheme = resolveTheme(theme);

	root.classList.toggle("dark", resolvedTheme === "dark");
	root.dataset.theme = theme;

	for (const toggle of document.querySelectorAll("[data-theme-toggle]")) {
		toggle.dataset.theme = theme;
		toggle.setAttribute(
			"title",
			theme === "light"
				? "Light theme"
				: theme === "dark"
					? "Dark theme"
					: "System theme",
		);
	}
}

function installThemeToggle() {
	const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) ?? "system";
	applyTheme(storedTheme);

	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", () => {
			if ((localStorage.getItem(THEME_STORAGE_KEY) ?? "system") === "system") {
				applyTheme("system");
			}
		});

	for (const toggle of document.querySelectorAll("[data-theme-toggle]")) {
		toggle.addEventListener("click", () => {
			const currentTheme = toggle.dataset.theme ?? storedTheme;
			const currentIndex = THEME_ORDER.indexOf(currentTheme);
			const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];

			localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
			applyTheme(nextTheme);
		});
	}
}

function installCopyButtons() {
	for (const button of document.querySelectorAll("[data-copy-button]")) {
		button.addEventListener("click", async () => {
			const text = button.dataset.copyText;

			if (!text || !navigator.clipboard?.writeText) {
				return;
			}

			await navigator.clipboard.writeText(text);
			button.dataset.copied = "true";

			window.setTimeout(() => {
				delete button.dataset.copied;
			}, 2000);
		});
	}
}

function installLazyVideos() {
	const videos = document.querySelectorAll("[data-lazy-video]");

	if (!videos.length) {
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) {
					continue;
				}

				const video = entry.target;
				video.setAttribute("preload", "metadata");
				video.addEventListener(
					"loadedmetadata",
					() => {
						video.play().catch(() => {});
					},
					{ once: true },
				);
				observer.unobserve(video);
			}
		},
		{ threshold: 0.1 },
	);

	for (const video of videos) {
		observer.observe(video);
	}
}

installThemeToggle();
installCopyButtons();
installLazyVideos();
