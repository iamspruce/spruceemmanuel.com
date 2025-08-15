---
title: "My First Blog Post"
description: "This is the beginning of my new blog. Here I will share my thoughts on web development."
pubDate: "2024-08-10"
---

Welcome to my new blog! Built with **Astro**, it's designed to be fast, content-focused, and a joy to write for.

## Why Astro?

I chose Astro for a few key reasons:

1.  **Performance**: Astro ships zero JavaScript by default. This means my site is incredibly fast.
2.  **Developer Experience**: Writing in `.astro` files or Markdown is straightforward and powerful.
3.  **Flexibility**: I can bring in any framework I want for interactive islands, but I don't have to.

Stay tuned for more updates and articles on technology and design.

// =============================================================================
// FILE: `src/content/writing/second-post.md`
// A second example blog post. No changes needed here.
// =============================================================================

---

title: 'Understanding Fluid Design with Utopia'
description: 'A quick look at how this site uses a fluid system for typography and spacing.'
pubDate: '2024-08-15'

---

This website doesn't use traditional media query breakpoints for typography and spacing. Instead, it uses a fluid system powered by [Utopia.fyi](https://utopia.fyi/).

## What is Fluid Design?

Fluid design allows elements to scale smoothly and continuously between a minimum and maximum viewport width. Instead of jumping between sizes at specific breakpoints (e.g., 768px, 1024px), the font sizes and spacing values grow and shrink proportionally to the screen size.

This is achieved using the CSS `clamp()` function. For example, a heading's font size might be defined like this:

```css
.heading {
  font-size: clamp(2rem, 1rem + 5vw, 4rem);
}
```

This sets the font size to be `1rem + 5vw`, but it will not go smaller than `2rem` or larger than `4rem`. Utopia generates all these `clamp()` values for you based on your configuration.
