import { HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import fs from "node:fs";

const site = JSON.parse(fs.readFileSync("./src/_data/site.json", "utf8"));

export default function (eleventyConfig) {
  // Rewrites root-relative URLs ("/press/") to include the GitHub Pages path prefix.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Every <img> in the output becomes a <picture> with WebP + a fallback, sized and lazy-loaded.
  // Screenshots pass eleventy:widths; cut-out art keeps its own size and stays PNG for transparency.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "auto"],
    widths: ["auto"],
    urlPath: "/img/",
    outputDir: "./_site/img/",
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
      pictureAttributes: {},
    },
  });

  // News feed (Atom) at /news/feed.xml, built from the "post" collection.
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/news/feed.xml",
    collection: { name: "post", limit: 20 },
    metadata: {
      language: "en",
      title: `${site.name} news`,
      subtitle: site.tagline,
      // Origin only: the plugin adds the GitHub Pages path prefix itself.
      base: new URL(site.url).origin + "/",
      author: { name: site.studio },
    },
  });

  // Dates are written as calendar days; format them in UTC so they never shift a day.
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addWatchTarget("src/static/");

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
