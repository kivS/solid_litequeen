import { buildSite } from './build'

await buildSite('development')

await import('./serve')
