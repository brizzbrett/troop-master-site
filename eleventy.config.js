import { HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

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

  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addWatchTarget("src/static/");

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
