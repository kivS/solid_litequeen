import { ArrowLeft } from '@/components/icons'
export default function PostPage({ post, ContentComponent, components }) {
  if (!post || !ContentComponent) {
    return null
  }

  return (
    <div className="typography prose mx-5 w-[95%] p-2 dark:prose-invert prose-h1:text-balance prose-h1:text-center">
      <div className="pb-8">
        <a
          href="/guides/"
          className="flex  items-center gap-2 no-underline hover:underline"
        >
          <ArrowLeft className="size-5" />
          All the posts
        </a>
      </div>

      <h1>{post.title}</h1>
      <p className="text-muted-foreground text-center text-sm">
        Published on{' '}
        {new Date(post.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </p>

      {post?.updated_at ? (
        <p className="text-muted-foreground text-center text-sm font-semibold">
          Last updated on{' '}
          {new Date(post.updated_at).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      ) : null}

      <ContentComponent components={components} />
    </div>
  )
}
