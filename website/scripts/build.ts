import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promises as fs } from 'node:fs'
import { compile, run } from '@mdx-js/mdx'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import * as cheerio from 'cheerio'
import { Feed } from 'feed'

import { rehypePlugins } from '../mdx/rehype.mjs'
import { recmaPlugins } from '../mdx/recma.mjs'
import { remarkPlugins } from '../mdx/remark.mjs'
import * as mdxComponents from '../src/components/mdx.jsx'
import GuidesLayout from '../src/app/guides/layout.jsx'
import GuidesPage from '../src/app/guides/page.jsx'
import GuidePostPage from '../src/app/guides/[slug]/page.jsx'
import FaqPage from '../src/app/_faq/page.jsx'
import NotFoundPage from '../src/app/not-found.jsx'
import guidePosts from '../src/app/guides/posts.json'

const ROOT = path.resolve(import.meta.dir, '..')
const DIST = path.join(ROOT, 'dist')
const SITE_URL = 'https://litequeen.vikborges.com'
const TITLE = 'Solid Lite Queen - Manage SQLite databases in your Rails app'
const DESCRIPTION =
  'Solid Lite Queen is an open-source SQLite database management software for your Rails app.'
const AUTHOR = {
  name: 'Vik Borges',
  email: 'kiv.d.dev@gmail.com',
  link: 'https://x.com/kivsegrob',
}

type BuildMode = 'development' | 'production'

const themeInitScript = `(() => {
	const storageKey = "theme";
	const savedTheme = localStorage.getItem(storageKey) ?? "system";
	const resolvedTheme =
		savedTheme === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: savedTheme;
	document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
	document.documentElement.dataset.theme = savedTheme;
})();`

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function withTrailingSlash(pathname: string) {
  if (pathname === '/') {
    return pathname
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function absoluteUrl(pathname: string) {
  return new URL(withTrailingSlash(pathname), SITE_URL).toString()
}

function renderDocument({
  title,
  description,
  body,
  pathname,
  stylesheetHref,
  scriptHref,
}: {
  title: string
  description: string
  body: string
  pathname: string
  stylesheetHref: string
  scriptHref: string
}) {
  const canonicalUrl = absoluteUrl(pathname)

  return `<!DOCTYPE html>
<html lang="en" class="h-full antialiased">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(title)}</title>
		<meta name="description" content="${escapeHtml(description)}" />
		<link rel="canonical" href="${canonicalUrl}" />
		<link rel="icon" href="/favicon.ico" sizes="any" />
		<link rel="icon" href="/favicon.ico" type="image/x-icon" />
		<link rel="alternate" type="application/rss+xml" title="Solid Lite Queen feed" href="/feed.xml" />
		<meta property="og:type" content="website" />
		<meta property="og:title" content="${escapeHtml(title)}" />
		<meta property="og:description" content="${escapeHtml(description)}" />
		<meta property="og:url" content="${canonicalUrl}" />
		<meta property="og:image" content="${SITE_URL}/opengraph-image.png" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="${escapeHtml(title)}" />
		<meta name="twitter:description" content="${escapeHtml(description)}" />
		<meta name="twitter:image" content="${SITE_URL}/twitter-image.png" />
		<link rel="stylesheet" href="${stylesheetHref}" />
		<script>${themeInitScript}</script>
	</head>
	<body class="flex min-h-full flex-col bg-white dark:bg-gray-950">
		${body}
		<script type="module" src="${scriptHref}"></script>
	</body>
</html>`
}

async function ensureCleanDirectory(directory: string) {
  await fs.rm(directory, { recursive: true, force: true })
  await fs.mkdir(directory, { recursive: true })
}

async function copyDirectory(source: string, destination: string) {
  await fs.mkdir(destination, { recursive: true })
  await fs.cp(source, destination, { recursive: true })
}

async function copyFile(source: string, destination: string) {
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.copyFile(source, destination)
}

async function writeRoute(pathname: string, html: string) {
  const routePath = pathname === '/' ? DIST : path.join(DIST, pathname)
  await fs.mkdir(routePath, { recursive: true })
  await fs.writeFile(path.join(routePath, 'index.html'), html)
}

async function compileMdxModule(filePath: string) {
  const source = await fs.readFile(filePath, 'utf8')
  const compiled = await compile(
    { value: source, path: filePath },
    {
      outputFormat: 'function-body',
      remarkPlugins,
      rehypePlugins,
      recmaPlugins,
      baseUrl: pathToFileURL(filePath),
    },
  )

  return run(compiled, {
    ...jsxRuntime,
    baseUrl: pathToFileURL(filePath),
  })
}

async function renderMdxPage(filePath: string) {
  const module = await compileMdxModule(filePath)

  return renderToStaticMarkup(
    React.createElement(module.default, {
      components: mdxComponents,
    }),
  )
}

function renderGuidesIndex() {
  return renderToStaticMarkup(
    React.createElement(GuidesLayout, {
      children: React.createElement(GuidesPage),
    }),
  )
}

async function renderGuidePost(post: (typeof guidePosts)[number]) {
  const module = await compileMdxModule(
    path.join(ROOT, 'src/app/guides', post.path),
  )

  return renderToStaticMarkup(
    React.createElement(GuidesLayout, {
      children: React.createElement(GuidePostPage, {
        post,
        ContentComponent: module.default,
        components: mdxComponents,
      }),
    }),
  )
}

function renderFaqPage() {
  return renderToStaticMarkup(React.createElement(FaqPage))
}

function renderNotFoundPage() {
  return renderToStaticMarkup(React.createElement(NotFoundPage))
}

function renderSitemap() {
  const urls = [
    '/',
    '/guides/',
    ...guidePosts.map((post) => `/guides/${post.slug}/`),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (pathname) => `	<url>
		<loc>${absoluteUrl(pathname)}</loc>
	</url>`,
  )
  .join('\n')}
</urlset>`
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
}

function renderFeed(homeHtml: string) {
  const feed = new Feed({
    title: 'Lite Queen',
    description: 'Sqlite web client for the minimalist developer',
    author: AUTHOR,
    id: SITE_URL,
    link: SITE_URL,
    image: `${SITE_URL}/favicon.ico`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
  })

  const $ = cheerio.load(homeHtml)

  $('article').each((_index, article) => {
    const id = $(article).attr('id')
    const title = $(article).find('h2').first().text()
    const date = $(article).find('time').first().attr('datetime')
    const content = $(article).find('[data-mdx-content]').first().html()

    if (!id || !title || !date || !content) {
      return
    }

    feed.addItem({
      title,
      id: `${SITE_URL}/#${id}`,
      link: `${SITE_URL}/#${id}`,
      content,
      author: [AUTHOR],
      contributor: [AUTHOR],
      date: new Date(date),
    })
  })

  return feed.rss2()
}

async function buildClientAssets(mode: BuildMode) {
  const build = await Bun.build({
    entrypoints: [path.join(ROOT, 'src/site/client.js')],
    outdir: path.join(DIST, 'assets'),
    target: 'browser',
    sourcemap: mode === 'development' ? 'external' : 'none',
    minify: mode === 'production',
    naming: '[name]-[hash].[ext]',
  })

  if (!build.success) {
    throw new Error('Bun client build failed')
  }

  const entry = build.outputs.find((output) => output.kind === 'entry-point')

  if (!entry) {
    throw new Error('Client bundle was not emitted')
  }

  return `/assets/${path.basename(entry.path)}`
}

async function buildStyles() {
  const process = Bun.spawn(
    [
      'bunx',
      '--bun',
      'postcss',
      'src/styles/tailwind.css',
      '-o',
      'dist/assets/app.css',
    ],
    {
      cwd: ROOT,
      stdout: 'inherit',
      stderr: 'inherit',
    },
  )

  const exitCode = await process.exited

  if (exitCode !== 0) {
    throw new Error(`CSS build failed with exit code ${exitCode}`)
  }

  return '/assets/app.css'
}

async function copyStaticAssets() {
  await copyDirectory(path.join(ROOT, 'public'), DIST)
  await copyFile(
    path.join(ROOT, 'src/app/favicon.ico'),
    path.join(DIST, 'favicon.ico'),
  )
  await copyFile(
    path.join(ROOT, 'src/app/opengraph-image.png'),
    path.join(DIST, 'opengraph-image.png'),
  )
  await copyFile(
    path.join(ROOT, 'src/app/twitter-image.png'),
    path.join(DIST, 'twitter-image.png'),
  )
  await copyFile(
    path.join(ROOT, 'src/fonts/Mona-Sans.var.woff2'),
    path.join(DIST, 'fonts/Mona-Sans.var.woff2'),
  )
}

export async function buildSite(mode: BuildMode = 'production') {
  await ensureCleanDirectory(DIST)
  await fs.mkdir(path.join(DIST, 'assets'), { recursive: true })
  const [stylesheetHref, scriptHref] = await Promise.all([
    buildStyles(),
    buildClientAssets(mode),
    copyStaticAssets(),
  ])

  const homeBody = await renderMdxPage(path.join(ROOT, 'src/app/page.mdx'))
  const guidesBody = renderGuidesIndex()
  const faqBody = renderFaqPage()
  const notFoundBody = renderNotFoundPage()

  await writeRoute(
    '/',
    renderDocument({
      title: TITLE,
      description: DESCRIPTION,
      body: homeBody,
      pathname: '/',
      stylesheetHref,
      scriptHref,
    }),
  )

  await writeRoute(
    'guides',
    renderDocument({
      title: 'Guides - Solid Lite Queen | Guides About Using Solid Lite Queen',
      description:
        'Learn how to use Solid Lite Queen with guides covering topics from installation and more.',
      body: guidesBody,
      pathname: '/guides/',
      stylesheetHref,
      scriptHref,
    }),
  )

  for (const post of guidePosts) {
    await writeRoute(
      path.join('guides', post.slug),
      renderDocument({
        title: post.title,
        description: post.description || `Guide for ${post.title}`,
        body: await renderGuidePost(post),
        pathname: `/guides/${post.slug}/`,
        stylesheetHref,
        scriptHref,
      }),
    )
  }

  await writeRoute(
    'faq',
    renderDocument({
      title: 'FAQ - Solid Lite Queen | Common Questions Answered',
      description:
        'Find answers to the most common questions about Solid Lite Queen.',
      body: faqBody,
      pathname: '/faq/',
      stylesheetHref,
      scriptHref,
    }),
  )

  await fs.writeFile(
    path.join(DIST, '404.html'),
    renderDocument({
      title: 'Page not found - Solid Lite Queen',
      description: 'The page you requested could not be found.',
      body: notFoundBody,
      pathname: '/404/',
      stylesheetHref,
      scriptHref,
    }),
  )

  await fs.writeFile(path.join(DIST, 'sitemap.xml'), renderSitemap())
  await fs.writeFile(path.join(DIST, 'robots.txt'), renderRobots())
  await fs.writeFile(path.join(DIST, 'feed.xml'), renderFeed(homeBody))
}

if (import.meta.path === Bun.main) {
  await buildSite(
    process.env.NODE_ENV === 'development' ? 'development' : 'production',
  )
}
