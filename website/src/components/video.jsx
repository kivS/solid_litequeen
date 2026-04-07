export function Video({ src, type, controls, loop }) {
  return (
    <video
      data-lazy-video
      controls={controls}
      loop={loop}
      preload="none"
      poster="/logo.webp"
      className="max-h-80 w-full"
    >
      <source src={src} type={type} />
      Your browser does not support the video tag.
    </video>
  )
}
