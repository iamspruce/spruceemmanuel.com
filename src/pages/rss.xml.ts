import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: any) {
    const writing = await getCollection("writing");
    return rss({
        title: "Spruce Emmanuel's Journal",
        description: "Writing about software development, AI, and more.",
        site: context.site,
        items: writing.map((post) => ({
            title: post.data.title,
            pubDate: new Date(post.data.pubDate),
            description: post.data.description,
            link: `/writing/${post.slug}/`,
        })),
    });
}
