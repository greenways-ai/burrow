import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
      return Response.json({ error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 });
    }

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BurrowBot/1.0)',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract article content (basic heuristic)
    // Remove script and style tags
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Try to find article content
    const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        content.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                        content.match(/<div[^>]*class=["'][^"']*(?:content|article|post)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

    let articleContent = '';
    if (articleMatch) {
      articleContent = articleMatch[1];
    } else {
      // Fallback: extract all paragraphs
      const paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      articleContent = paragraphs.slice(0, 20).join('');
    }

    // Strip HTML tags
    const textContent = articleContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit content length
    const maxLength = 15000;
    const truncatedContent = textContent.length > maxLength 
      ? textContent.slice(0, maxLength) + '... [content truncated]'
      : textContent;

    return Response.json({
      title,
      description,
      url,
      content: truncatedContent,
      wordCount: textContent.split(/\s+/).length,
    });

  } catch (error) {
    console.error('URL analysis error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: errorMsg }, { status: 500 });
  }
}
