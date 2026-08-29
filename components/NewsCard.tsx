"use client";

import { useState } from "react";

const NEWS_ARTICLES = [
  {
    tag: "FAIR NEWS",
    headline: "Global 7500 availability tightens",
    body: "Delivery positions for late-model 7500s remain scarce. Off-market conversations now account for a larger share of closed large-cabin trades.",
    image: "/images/global7500.jpeg",
  },
  {
    tag: "MARKET UPDATE",
    headline: "Gulfstream G700 demand surges in Q3",
    body: "The G700 programme continues to attract ultra-high-net-worth buyers. Backlogs have extended into late 2026 across all major regions.",
    image: "/images/g700.jpeg",
  },
  {
    tag: "DEAL FLOW",
    headline: "Falcon 8X off-market trades hit record",
    body: "Dassault tri-engine flagship is changing hands quietly, driven by range requirements and a growing preference for European airframes.",
    image: "/images/falcon8x.jpeg",
  },
  {
    tag: "ADVISORY",
    headline: "Pre-buy inspection timelines stretch to 6 weeks",
    body: "Increased transaction volume and limited MRO availability are extending pre-purchase inspection windows for heavy-jet acquisitions.",
    image: "/images/g650er.jpeg",
  },
];

export default function NewsCard() {
  const [active, setActive] = useState(2);

  const prev = () => setActive((a) => (a - 1 + NEWS_ARTICLES.length) % NEWS_ARTICLES.length);
  const next = () => setActive((a) => (a + 1) % NEWS_ARTICLES.length);

  const article = NEWS_ARTICLES[active];

  return (
    <section className="news-card-section">
      <button className="news-nav-arrow news-nav-left" onClick={prev} aria-label="Previous article">
        &#8592;
      </button>

      <div className="news-card">
        <div className="news-card-img">
          <img src={article.image} alt={article.headline} />
        </div>

        <div className="news-card-body">
          <div className="news-tag">{article.tag}</div>
          <h2 className="news-headline">{article.headline}</h2>
          <p className="news-desc">{article.body}</p>

          <div className="news-dots">
            {NEWS_ARTICLES.map((_, i) => (
              <button
                key={i}
                className={"news-dot" + (i === active ? " active" : "")}
                onClick={() => setActive(i)}
                aria-label={"Article " + (i + 1)}
              />
            ))}
          </div>
        </div>
      </div>

      <button className="news-nav-arrow news-nav-right" onClick={next} aria-label="Next article">
        &#8594;
      </button>
    </section>
  );
}