import { useEffect } from "react";

const DEFAULT_IMAGE = "https://vuta.app/assets/logo.png";

const setMetaTag = ({ attr = "name", key, value }) => {
  if (!value) {
    return;
  }

  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", value);
};

const setLinkTag = ({ href, rel }) => {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
};

export default function SEOHead({
  canonical = "https://vuta.app/",
  description,
  image = DEFAULT_IMAGE,
  title,
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Vuta`
      : "Vuta | Trusted Beauty Closer";

    document.title = fullTitle;
    setLinkTag({ href: canonical, rel: "canonical" });
    setMetaTag({ key: "description", value: description });
    setMetaTag({ key: "robots", value: "index, follow" });
    setMetaTag({ attr: "property", key: "og:title", value: fullTitle });
    setMetaTag({ attr: "property", key: "og:description", value: description });
    setMetaTag({ attr: "property", key: "og:image", value: image });
    setMetaTag({ attr: "property", key: "og:site_name", value: "Vuta" });
    setMetaTag({ attr: "property", key: "og:type", value: "website" });
    setMetaTag({ attr: "property", key: "og:url", value: canonical });
    setMetaTag({ key: "twitter:card", value: "summary_large_image" });
    setMetaTag({ key: "twitter:title", value: fullTitle });
    setMetaTag({ key: "twitter:description", value: description });
    setMetaTag({ key: "twitter:image", value: image });
  }, [canonical, description, image, title]);

  return null;
}
