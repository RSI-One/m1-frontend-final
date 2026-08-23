"use client";

import { useRef, useState } from "react";

export default function CarouselRow({
  title,
  children,
  small = false,
  headClassName = "assets-header",
  headingTag = "h3",
}: {
  title?: string;
  children: React.ReactNode;
  small?: boolean;
  headClassName?: string;
  headingTag?: "h2" | "h3";
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);

  const scroll = (dir: number) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir * 460, behavior: "smooth" });
    if (dir > 0) setShowLeft(true);
  };

  return (
    <div className="carousel-block">
      <div className={headClassName}>
        {title && (headingTag === "h2" ? <h2>{title}</h2> : <h3>{title}</h3>)}
        <div className={`carousel-nav ${small ? "carousel-nav-sm" : ""}`}>
          <div
            className={`nav-arrow ${small ? "nav-arrow-sm" : ""} ${showLeft ? "" : "hidden"}`}
            onClick={() => scroll(-1)}
          >
            ←
          </div>
          <div className={`nav-arrow ${small ? "nav-arrow-sm" : ""}`} onClick={() => scroll(1)}>
            →
          </div>
        </div>
      </div>
      <div className="asset-row" ref={rowRef}>
        {children}
      </div>
    </div>
  );
}
