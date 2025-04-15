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
			onMouseEnter={(event) => event.target.setAttribute("preload", "metadata")}
			className="w-full max-h-80"
		>
			<source src={src} type={type} />
			Your browser does not support the video tag.
		</video>
	);
}
