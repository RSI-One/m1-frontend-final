"use client";

import { AnimatePresence, motion } from "framer-motion";
import { sfSpecsFor } from "../lib/data";
import { SfItem } from "../lib/types";

interface ComparisonRow {
  label: string;
  numeric: ((value: ReturnType<typeof sfSpecsFor>) => number) | null;
  format: (value: ReturnType<typeof sfSpecsFor>) => string | number;
}

const rows: ComparisonRow[] = [
  {
    label: "Passengers",
    numeric: (value) => value.passengers,
    format: (value) => value.passengers,
  },
  {
    label: "Cabin Length",
    numeric: (value) => value.cabin,
    format: (value) => `${value.cabin.toFixed(1)} ft`,
  },
  {
    label: "Range",
    numeric: (value) => value.range,
    format: (value) => `${value.range.toLocaleString()} nm`,
  },
  {
    label: "Market Value",
    numeric: null,
    format: (value) => value.price,
  },
  {
    label: "Engine",
    numeric: null,
    format: (value) => value.engine,
  },
  {
    label: "Cruise Speed",
    numeric: (value) => value.cruise,
    format: (value) => `${value.cruise} kts`,
  },
  {
    label: "Max Altitude",
    numeric: (value) => value.maxAlt,
    format: (value) => `FL${value.maxAlt}`,
  },
  {
    label: "Year",
    numeric: (value) => value.year,
    format: (value) => value.year,
  },
  {
    label: "Total Hours",
    numeric: (value) => value.hours,
    format: (value) => value.hours.toLocaleString(),
  },
  {
    label: "Health Score",
    numeric: (value) => value.health,
    format: (value) => `${value.health}/100`,
  },
];

interface CompareModalProps {
  items: SfItem[];
  onClose: () => void;
}

export default function CompareModal({
  items,
  onClose,
}: CompareModalProps) {
  const specs = items.map((item) => {
    const spec = sfSpecsFor(item);
    // Prefer the real backend price (SfItem.price) over the synthetic
    // formula value when this item came from the API.
    return item.price ? { ...spec, price: item.price } : spec;
  });
  const count = specs.length;
  const maxRange = count
    ? Math.max(...specs.map((spec) => spec.range))
    : 0;

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          className="modal-backdrop open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            className="compare-modal"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="close-x"
              aria-label="Close comparison"
              onClick={onClose}
            >
              ✕
            </button>

            <div className="cmp-header">
              <h2>
                Aircraft Comparison
                <span>— {count} selected</span>
              </h2>
            </div>

            <div
              className="cmp-table"
              style={{
                gridTemplateColumns: `170px repeat(${count || 1}, 1fr)`,
              }}
            >
              <div
                className="cmp-cell cmp-label"
                style={{
                  background: "transparent",
                  borderBottom: "none",
                }}
              />

              {specs.map((spec, index) => {
                const item = items[index];

                return (
                  <div
                    className="cmp-aircraft-head"
                    key={`${spec.name}-${index}`}
                  >
                    <div className="img-slot">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={spec.name}
                        />
                      ) : (
                        <div className="compare-image-placeholder">
                          No image
                        </div>
                      )}
                    </div>

                    <h3>{spec.name}</h3>
                    <div className="cc-price">
                      {spec.price}
                    </div>
                  </div>
                );
              })}

              {rows.map((row) => {
                const best = row.numeric
                  ? Math.max(
                      ...specs.map((spec) =>
                        row.numeric!(spec),
                      ),
                    )
                  : -Infinity;

                return (
                  <div
                    key={row.label}
                    style={{ display: "contents" }}
                  >
                    <div className="cmp-cell cmp-label">
                      {row.label}
                    </div>

                    {specs.map((spec, index) => {
                      const isBest = row.numeric
                        ? row.numeric(spec) === best
                        : false;

                      return (
                        <div
                          className="cmp-cell cmp-value"
                          key={`${spec.name}-${row.label}-${index}`}
                        >
                          <span>{row.format(spec)}</span>

                          {isBest && (
                            <span className="cmp-best">
                              BEST
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="cmp-range-viz">
              <div className="rv-title">
                Range Visualization
              </div>

              <div
                className="rv-row"
                style={{
                  gridTemplateColumns: `repeat(${count || 1}, 1fr)`,
                }}
              >
                {specs.map((spec, index) => (
                  <div
                    className={
                      spec.range === maxRange
                        ? "rv-item rv-best"
                        : "rv-item"
                    }
                    key={`${spec.name}-range-${index}`}
                  >
                    <span className="rv-num">
                      {spec.range.toLocaleString()}
                    </span>
                    <span className="rv-unit">nm</span>
                    <div className="rv-name">
                      {spec.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
