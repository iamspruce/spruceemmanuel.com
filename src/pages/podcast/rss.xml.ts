export async function GET() {
  const rssUrl = import.meta.env.PODCAST_RSS_URL;

  if (!rssUrl) {
    return new Response("PODCAST_RSS_URL not configured", { status: 500 });
  }

  try {
    const res = await fetch(rssUrl);
    if (!res.ok) throw new Error("Failed to fetch RSS from GitHub Pages");

    const rssContent = await res.text();
    return new Response(rssContent, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600"
      },
    });
  } catch (error) {
    return new Response("Podcast feed not found. Make sure the bot has published it to GitHub Pages.", { status: 404 });
  }
}
