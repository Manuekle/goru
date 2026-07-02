import type { MetadataRoute } from 'next'

const URL = 'https://goru.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${URL}/auth/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
