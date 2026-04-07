import guideList from './posts.json'

export default function Guides() {
  return (
    <div className="container">
      <div className="flex flex-col items-center gap-4">
        {guideList.map((post) => (
          <a
            key={post.slug}
            href={`/guides/${post.slug}/`}
            className="flex rounded border p-2 transition-transform  hover:scale-105 md:w-2/3"
          >
            <div>
              <p className="text-lg font-semibold">{post.title}</p>
              <p className="text-muted-foreground text-sm">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
