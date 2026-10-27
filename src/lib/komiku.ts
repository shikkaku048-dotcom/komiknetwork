import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const KOMIKU_BASE = "https://komiku.org"; 
const KOMIKU_API = "https://api.komiku.org";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const GENRE_SLUGS: Record<string, string> = {
  "Action": "action", "Romance": "romance", "Isekai": "isekai",
  "Murim": "martial-arts", "School Life": "school-life", "Fantasy": "fantasy",
  "Comedy": "comedy", "Horror": "horror", "Mystery": "mystery"
};

// Membersihkan URL agar tidak ada double slash (//) atau format aneh
function cleanUrl(url: string, base: string = KOMIKU_BASE): string {
  if (!url) return "";
  let clean = url.trim();
  if (clean.startsWith("//")) {
    clean = `https:${clean}`;
  } else if (!clean.startsWith("http")) {
    clean = `${base}${clean.startsWith("/") ? "" : "/"}${clean}`;
  }
  clean = clean.replace(/([^:]\/)\/+/g, "$1");
  return clean;
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Referer": KOMIKU_BASE, 
      },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 3600 } // Cache 1 jam
    });

    if (res.ok) return await res.text();
    console.error(`[KOMIKU] Gagal fetch. Status: ${res.status}`);
  } catch (error) {
    console.log(`[KOMIKU] Fetch error pada ${url}: ${(error as Error).message}`);
  }
  return "";
}

function parseKomikuPage(html: string): any[] {
  const $ = cheerio.load(html);
  const comics: any[] = [];
  const seenIds = new Set<string>();
  const selectors = ['.bge', '.manga-item', '.list-comic', '.comic-item', '.item'];

  for (const selector of selectors) {
    $(selector).each((i, el) => {
      const container = $(el);
      const linkEl = container.find('a[href*="/manga/"], a[href*="/komik/"]').first();
      const href = linkEl.attr('href');
      if (!href) return;

      const imgEl = container.find('img').first();
      let img = imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('data-lazy-src') || "";
      if (!img || img.startsWith('data:image')) return;

      let title = container.find('.judul, .title, h3, h4, .tpel_inf').text().trim() || linkEl.attr('title') || imgEl.attr('alt') || linkEl.text().trim();
      if (!title) {
        const urlParts = href.split('/').filter(Boolean);
        if (urlParts.length > 0) title = urlParts[urlParts.length - 1].replace(/-/g, ' ');
      }
      title = title.replace(/^(Sampul|Cover)\s+/i, '').replace(/\s+/g, ' ').trim();

      let chapterNumber = "?";
      const chapterLink = container.find('a[href*="chapter-"], a[href*="ch-"]').last();
      if (chapterLink.length > 0) {
        const match = (chapterLink.attr('href') || "").match(/(?:chapter|ch)-(\d+(\.\d+)?)/i) || chapterLink.text().match(/(\d+(\.\d+)?)/);
        if (match) chapterNumber = match[1];
      } else {
        const match = container.find('.up, .newch, .chapter').text().match(/(\d+(\.\d+)?)/);
        if (match) chapterNumber = match[0];
      }

      if (title && title.length > 2) {
        const fullUrl = cleanUrl(href);
        const fullImg = cleanUrl(img);
        const comicId = `komiku:${encodeURIComponent(fullUrl)}`;

        if (!seenIds.has(comicId)) {
          seenIds.add(comicId);
          const cardText = container.text().toLowerCase();
          let typeText = "Manga";
          if (cardText.includes("manhwa")) typeText = "Manhwa";
          else if (cardText.includes("manhua")) typeText = "Manhua";

          comics.push({
            id: comicId, title, type: typeText, img: fullImg, 
            rating: 5, readers: "Komiku", chapters: chapterNumber, source: "komiku"
          });
        }
      }
    });
    if (comics.length > 0) break;
  }
  return comics;
}

// Fallback Scraper (Hanya jalan di localhost)
export async function scrapeKomikuPopular(page = 1, limit = 20, category = "Semua", genre = "Semua"): Promise<{ data: any[], total: number }> {
  try {
    let allComics: any[] = [];
    let baseUrl = `${KOMIKU_API}/manga`;
    if (genre !== "Semua" && GENRE_SLUGS[genre]) baseUrl = `${KOMIKU_API}/genre/${GENRE_SLUGS[genre]}`;

    const pagesToFetch = 10; 
    const urls = Array.from({ length: pagesToFetch }, (_, i) => `${baseUrl}/page/${i + 1}/`);
    const htmlResults = await Promise.all(urls.map(url => fetchHtml(url)));
    
    htmlResults.forEach(html => { if (html) allComics.push(...parseKomikuPage(html)); });

    if (allComics.length === 0 && genre !== "Semua") {
      const webBase = `${KOMIKU_BASE}/genre/${GENRE_SLUGS[genre]}`;
      const webUrls = Array.from({ length: pagesToFetch }, (_, i) => i === 0 ? `${webBase}/` : `${webBase}/page/${i + 1}/`);
      const webHtmls = await Promise.all(webUrls.map(url => fetchHtml(url)));
      webHtmls.forEach(html => { if (html) allComics.push(...parseKomikuPage(html)); });
    }

    if (category !== "Semua") {
      allComics = allComics.filter((c) => c.type.toLowerCase() === category.toLowerCase());
    }

    const seen = new Set<string>();
    const uniqueComics = allComics.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    const offset = (page - 1) * limit;
    return { data: uniqueComics.slice(offset, offset + limit), total: uniqueComics.length };
  } catch (error) {
    return { data: [], total: 0 };
  }
}

// Baca dari Supabase (Prioritas Utama)
export async function getKomikuPopularManga(page = 1, limit = 20, category = 'Semua', genre = 'Semua'): Promise<{ data: any[]; total: number }> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  let q = sb.from('komiku_comics').select('id,title,type,img,chapters', { count: 'exact' });
  if (category !== 'Semua') q = q.ilike('type', category);
  if (genre !== 'Semua') q = q.contains('genres', [genre]);

  const from = (page - 1) * limit;
  const { data, count, error } = await q.order('rank', { ascending: true }).range(from, from + limit - 1);
  
  if (!error && data && data.length > 0) {
    return {
      data: data.map((c) => ({ ...c, img: cleanUrl(c.img), rating: 5, readers: 'Komiku', source: 'komiku' })),
      total: count ?? data.length,
    };
  }

  // Hanya lakukan scraping di localhost
  if (process.env.NODE_ENV !== 'production') {
    return scrapeKomikuPopular(page, limit, category, genre);
  }
  
  return { data: [], total: 0 };
}

export async function getKomikuMangaDetail(url: string) {
  try {
    const cleanMangaUrl = cleanUrl(url);
    const html = await fetchHtml(cleanMangaUrl);
    
    if (!html) {
      const slug = cleanMangaUrl.split("/manga/")[1]?.replace("/", "") || "komik";
      return {
        title: slug.replace(/-/g, " ").toUpperCase(),
        img: "https://placehold.co/400x600/png?text=Gambar+Tidak+Tersedia",
        description: "Gagal memuat deskripsi dari Komiku (Server memblokir akses).",
        chapters: [], url: cleanMangaUrl
      };
    }

    const $ = cheerio.load(html);
    const title = $('h1[itemprop="name"], .judul h1, h1').first().text().trim() || "Judul Tidak Diketahui";
    let img = cleanUrl($('img[itemprop="image"], .ims img, .thumb img').attr('src') || "");
    const description = $('.desc, #sinopsis, [itemprop="description"]').text().trim().replace(/\s+/g, ' ') || "Belum ada deskripsi.";
    
    const chapters: any[] = [];
    $('#daftarChapter tr, .chapter-list a, table tr').each((i, el) => {
      const linkEl = $(el).find('a');
      const link = linkEl.attr('href');
      const chapterName = linkEl.text().trim();
      
      if (link && chapterName && !link.includes('manga/')) {
        const fullUrl = cleanUrl(link);
        const chapterNumber = chapterName.match(/\d+(\.\d+)?/)?.[0] || chapterName;
        chapters.push({ id: fullUrl, chapter: chapterNumber, title: chapterName, publishAt: null });
      }
    });
    
    return { title, img, description, chapters, url: cleanMangaUrl };
  } catch (error) {
    return null;
  }
}

export async function getKomikuChapterPages(url: string): Promise<string[]> {
  try {
    if (!url.startsWith("http")) return [];
    const html = await fetchHtml(cleanUrl(url));
    if (!html) return [];
    
    const $ = cheerio.load(html);
    const images: string[] = [];
    const selectors = ['#Baca_Komik img', '.main-reading-area img', '.chapter-img img', '#readerarea img', '.reading-content img'];
    
    for (const selector of selectors) {
      const foundImages = $(selector);
      if (foundImages.length > 0) {
        foundImages.each((i, el) => {
          let src = $(el).attr('data-src') || $(el).attr('data-original') || $(el).attr('data-lazy-src') || $(el).attr('src');
          let alt = ($(el).attr('alt') || "").toLowerCase();
          const parentClass = ($(el).parent().attr('class') || "").toLowerCase();
          const parentId = ($(el).parent().attr('id') || "").toLowerCase();

          if (src && !src.startsWith('data:')) {
            const fullImg = cleanUrl(src);
            const lowerImg = fullImg.toLowerCase();
            
            const blacklistUrls = ["logo", "banner", "promo", "iklan", "credit", "natsu", "donasi", "mgkomik", "mirror", "join", "gacor", "slot", "judi", "ads", "komikindo", "westmanga", "kiryuu", "shinigami", "sektekomik", "baca"];
            const blacklistAlts = ["komiku", "baca", "iklan", "promo", "credit", "mgkomik", "mirror", "join", "banner"];
            const blacklistParents = ["ads", "banner", "promo", "iklan", "ad-container"];

            const isUrlBlacklisted = blacklistUrls.some(k => lowerImg.includes(k));
            const isAltBlacklisted = blacklistAlts.some(k => alt.includes(k));
            const isParentBlacklisted = blacklistParents.some(k => parentClass.includes(k) || parentId.includes(k));

            if (!isUrlBlacklisted && !isAltBlacklisted && !isParentBlacklisted) {
              images.push(fullImg);
            }
          }
        });
        if (images.length > 0) break;
      }
    }
    return images;
  } catch (error) {
    return [];
  }
}

export async function searchKomiku(query: string): Promise<any[]> {
  try {
    let results: any[] = [];
    const seenIds = new Set<string>();

    // 1. CARI DI SUPABASE
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await sb.from('komiku_comics').select('*').ilike('title', `%${query}%`).limit(20);

    if (!error && data) {
      data.forEach(c => {
        seenIds.add(c.id);
        results.push({ ...c, img: cleanUrl(c.img), rating: 5, readers: "Komiku", source: "komiku" });
      });
    }

    // 2. SCRAPING AGRESIF (LOKAL SAJA)
    if (process.env.NODE_ENV !== 'production') {
      
      // A. Coba lewat API (biasanya lebih bersih)
      try {
        const apiUrl = `${KOMIKU_API}/?s=${encodeURIComponent(query)}&post_type=manga`;
        const apiHtml = await fetchHtml(apiUrl);
        if (apiHtml) {
          const parsed = parseKomikuPage(apiHtml);
          parsed.forEach((c: any) => {
            if (!seenIds.has(c.id)) { seenIds.add(c.id); results.push(c); }
          });
        }
      } catch (e) {} // Abaikan jika API mati/404

      // B. Coba lewat Web (jika API tidak menghasilkan apa-apa)
      if (results.length <= 1) {
        for (let page = 1; page <= 2; page++) {
          const webUrl = page === 1 
            ? `${KOMIKU_BASE}/?s=${encodeURIComponent(query)}`
            : `${KOMIKU_BASE}/page/${page}/?s=${encodeURIComponent(query)}`;
            
          const webHtml = await fetchHtml(webUrl);
          if (!webHtml) break;

          const parsed = parseKomikuPage(webHtml);
          if (parsed.length === 0) break;

          parsed.forEach((c: any) => {
            if (!seenIds.has(c.id)) { seenIds.add(c.id); results.push(c); }
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("[KOMIKU] Gagal search:", error);
    return [];
  }
}