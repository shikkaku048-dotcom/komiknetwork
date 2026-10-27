import { MetadataRoute } from 'next'
import { getPopularManga } from '@/lib/mangadex'
import { getKomikuPopularManga } from '@/lib/komiku'

// Jangan di-prerender saat build
export const dynamic = 'force-dynamic'

type SitemapEntry = MetadataRoute.Sitemap[number]

// Batasi tiap sumber maksimal 8 detik, kalau lewat dianggap gagal
function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ])
}

async function getAllComics(): Promise<any[]> {
  // HANYA AMBIL DARI MANGADEX & KOMIKU
  const [mdxRes, komikuRes] = await Promise.allSettled([
    withTimeout(getPopularManga()),
    withTimeout(getKomikuPopularManga(1, 100, 'Semua')),
  ])

  // Pastikan fallback selalu array kosong ([]) jika gagal
  const mdxData = mdxRes.status === 'fulfilled' ? (mdxRes.value?.data ?? []) : []
  const komikuData = komikuRes.status === 'fulfilled' ? (komikuRes.value?.data ?? []) : []

  // Gabungkan dengan aman
  const all = [...mdxData, ...komikuData].filter(
    (c: any) => c && c.id
  )
  
  // Hapus duplikat berdasarkan ID
  return Array.from(new Map(all.map((c: any) => [c.id, c])).values())
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://komiknet.site'
  const now = new Date()

  const staticRoutes: SitemapEntry[] = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/katalog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/download`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  let comicRoutes: SitemapEntry[] = []
  try {
    const comics = await getAllComics()
    comicRoutes = comics.map((comic: any) => ({
      url: `${baseUrl}/comic/${encodeURIComponent(comic.id)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (e) {
    console.error('Gagal ambil data sitemap:', e)
  }

  return [...staticRoutes, ...comicRoutes]
}