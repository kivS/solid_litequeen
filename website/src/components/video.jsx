"use client";

import { useEffect, useRef } from "react";

export function Video({ src, type, controls, loop }) {
	const videoRef = useRef(null);

	useEffect(() => {
		if (!videoRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const video = entry.target;
						video.setAttribute("preload", "metadata");

						// Add event listener to play video once metadata is loaded
						video.addEventListener(
							"loadedmetadata",
							() => {
								video.play();
							},
							{ once: true },
						);

						// Disconnect after triggering
						observer.disconnect();
					}
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(videoRef.current);

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		// biome-ignore lint/a11y/useMediaCaption: <explanation>
		<video
			ref={videoRef}
			controls={controls}
			loop={loop}
			preload="none"
			// autoPlay={true}
			poster="/logo.webp"
			className="w-full max-h-80"
		>
			<source src={src} type={type} />
			Your browser does not support the video tag.
		</video>
	);
}
