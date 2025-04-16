"use client";

export function Video({ src, type, controls, loop }) {
	return (
		// biome-ignore lint/a11y/useMediaCaption: <explanation>
		<video
			controls={controls}
			loop={loop}
			preload="none"
			// autoPlay={true}
			poster="/logo.webp"
			onMouseEnter={(event) => {
				event.target.setAttribute("preload", "metadata");
				// Add event listener to play video once metadata is loaded
				event.target.addEventListener(
					"loadedmetadata",
					() => {
						event.target.play();
					},
					{ once: true },
				);
			}}
			className="w-full max-h-80"
		>
			<source src={src} type={type} />
			Your browser does not support the video tag.
		</video>
	);
}
