"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import AssetCard from "./AssetCard";
import CarouselRow from "./CarouselRow";
import {
  cityOptions,
  sfAdditional,
  sfAlternative,
  sfFeatured,
} from "../lib/data";
import { SfItem } from "../lib/types";

const planeCategories = [
  "Light Jets",
  "Mid-Size",
  "Heavy Jets",
  "DIVIDER",
  "🚁 Helicopter",
  "DIVIDER",
  "Long Range",
  "VIP Airliner",
  "Turboprop",
];

const wizTitles = ["Plane Type", "Budget", "Range", "Usage"];

const wizSubtitles = [
  "Choose the aircraft category that fits your mission",
  "Set your acquisition budget — we'll match assets in range",
  "Your route determines the minimum range requirement",
  "Annual hours help us recommend the right utilization tier",
];

const SF_COMPARE_MAX = 4;
const SF_COMPARE_MIN = 2;

function paintPct(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}

interface WizardProps {
  onBack: () => void;
  onOpenAsset: (item: SfItem) => void;
  onOpenCompare: (items: SfItem[]) => void;
}

export default function Wizard({
  onBack,
  onOpenAsset,
  onOpenCompare,
}: WizardProps) {
  const [wstep, setWstep] = useState(0);
  const [selectedPlane, setSelectedPlane] = useState("🚁 Helicopter");
  const [budget, setBudget] = useState(20);
  const [usage, setUsage] = useState(200);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [pax, setPax] = useState(15);
  const [year, setYear] = useState(10);
  const [urgency, setUrgency] = useState(9);

  const [sfSelected, setSfSelected] = useState<SfItem[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoAdvance = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoAdvance = () => {
    stopAutoAdvance();

    timerRef.current = setInterval(() => {
      setWstep((previous) => {
        if (previous >= 3) {
          stopAutoAdvance();
          return previous;
        }

        return previous + 1;
      });
    }, 5000);
  };

  useEffect(() => {
    startAutoAdvance();

    return () => {
      stopAutoAdvance();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPrev = () => {
    if (wstep > 0) {
      setWstep(wstep - 1);
      startAutoAdvance();
    }
  };

  const goNext = () => {
    if (wstep < 3) {
      setWstep(wstep + 1);
      startAutoAdvance();
    } else {
      setWstep(0);
      startAutoAdvance();
    }
  };

  const toggleCompare = (item: SfItem) => {
    setSfSelected((previous) => {
      const exists = previous.some(
        (selectedItem) => selectedItem.name === item.name,
      );

      if (exists) {
        return previous.filter(
          (selectedItem) => selectedItem.name !== item.name,
        );
      }

      const next = [...previous, item];

      if (next.length > SF_COMPARE_MAX) {
        return next.slice(1);
      }

      return next;
    });
  };

  const isSelected = (name: string) =>
    sfSelected.some((item) => item.name === name);

  // Card click now selects the asset for comparison and opens its modal.
  const handleAssetClick = (item: SfItem) => {
    toggleCompare(item);
    onOpenAsset(item);
  };

  const rangeHint =
    from && to ? "≈ 3,414 NM" : "Select both cities to calculate";

  return (
    <div className="wiz-card">
      <div
        className="wiz-top-progress"
        style={{ width: `${((wstep + 1) / 4) * 100}%` }}
      />

      <div className="wizard-topbar">
        <button
          type="button"
          className="wiz-back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="wizard-progress">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={
                index === wstep ? "wiz-dot active" : "wiz-dot"
              }
            />
          ))}
        </div>

        <span className="wizard-counter">
          {wstep + 1} / 4
        </span>

        <span className="wizard-heading-inline">
          {wizTitles[wstep]}
        </span>

        <div className="wiz-arrows">
          <button
            type="button"
            className={
              wstep === 0
                ? "wiz-arrow-btn prev disabled"
                : "wiz-arrow-btn prev"
            }
            onClick={goPrev}
          >
            ‹
          </button>

          <button
            type="button"
            className="wiz-arrow-btn next"
            onClick={goNext}
          >
            ›
          </button>
        </div>
      </div>

      <div className="wizard-subtitle">
        {wizSubtitles[wstep]}
      </div>

      <div className="wiz-divider" />

      <AnimatePresence mode="wait">
        <motion.div
          key={wstep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {wstep === 0 && (
            <div>
              <div className="cat-label">
                Select aircraft category:
              </div>

              <div className="plane-buttons-light">
                {planeCategories.map((category, index) =>
                  category === "DIVIDER" ? (
                    <div
                      className="plane-divider-light"
                      key={`divider-${index}`}
                    />
                  ) : (
                    <button
                      type="button"
                      key={category}
                      className={
                        selectedPlane === category
                          ? "plane-chip-light selected"
                          : "plane-chip-light"
                      }
                      onClick={() => setSelectedPlane(category)}
                    >
                      {category}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {wstep === 1 && (
            <div>
              <div className="wiz-slider-row-light">
                <span className="wiz-slider-label-light">
                  Budget range (USD millions):
                </span>

                <div className="wiz-amount-box-light">
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(event) =>
                      setBudget(Number(event.target.value) || 0)
                    }
                  />
                  <span className="suffix">M</span>
                </div>
              </div>

              <input
                type="range"
                className="wiz-range-light"
                min={1}
                max={100}
                value={budget}
                onChange={(event) =>
                  setBudget(Number(event.target.value))
                }
                style={{
                  background: `linear-gradient(90deg, #1a1c22 ${paintPct(budget, 1, 100)}%, rgba(0,0,0,0.12) ${paintPct(budget, 1, 100)}%)`,
                }}
              />

              <div className="wiz-ticks-light">
                <span>$1M · Entry</span>
                <span>$7.5M</span>
                <span>$15M</span>
                <span>$35M</span>
                <span>$50M</span>
                <span>$100M+</span>
              </div>
            </div>
          )}

          {wstep === 2 && (
            <div>
              <div className="wiz-range-fields-light">
                <span className="route-label">Route:</span>

                <input
                  type="text"
                  placeholder="Departure city..."
                  list="cityOptions"
                  autoComplete="off"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />

                <span className="wiz-range-arrow">→</span>

                <input
                  type="text"
                  placeholder="Destination city..."
                  list="cityOptions"
                  autoComplete="off"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />

                <span className="wiz-range-hint">
                  {rangeHint}
                </span>
              </div>

              <datalist id="cityOptions">
                {cityOptions.map((city) => (
                  <option value={city} key={city} />
                ))}
              </datalist>
            </div>
          )}

          {wstep === 3 && (
            <div>
              <div className="wiz-slider-row-light">
                <span className="wiz-slider-label-light">
                  Estimated flight hours per year:
                </span>

                <div className="wiz-amount-box-light">
                  <input
                    type="number"
                    value={usage}
                    onChange={(event) =>
                      setUsage(Number(event.target.value) || 0)
                    }
                  />
                  <span className="suffix">hrs/yr</span>
                </div>
              </div>

              <input
                type="range"
                className="wiz-range-light"
                min={0}
                max={1500}
                value={usage}
                onChange={(event) =>
                  setUsage(Number(event.target.value))
                }
                style={{
                  background: `linear-gradient(90deg, #1a1c22 ${paintPct(usage, 0, 1500)}%, rgba(0,0,0,0.12) ${paintPct(usage, 0, 1500)}%)`,
                }}
              />

              <div className="wiz-ticks-light">
                <span>50 hrs · Occasional</span>
                <span>750 hrs</span>
                <span>1,500 hrs · Heavy</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
 {/* Always-visible asset preview */}
      <div className="wiz-refine-divider" />

      <div className="assets-body wiz-assets-preview">
        <div className="assets-sidebar">
          <div className="side-filter">
            <div className="side-filter-label">
              Passengers
              <span className="side-filter-value">
                {pax === 100 ? "100+" : pax}
              </span>
            </div>

            <input
              type="range"
              className="wiz-range-light"
              min={2}
              max={100}
              value={pax}
              onChange={(event) =>
                setPax(Number(event.target.value))
              }
              style={{
                background: `linear-gradient(90deg, #1a1c22 ${paintPct(pax, 2, 100)}%, rgba(0,0,0,0.12) ${paintPct(pax, 2, 100)}%)`,
              }}
            />

            <div className="side-filter-labels">
              <span>2</span>
              <span>100+</span>
            </div>
          </div>

          <div className="side-filter">
            <div className="side-filter-label">
              Model Year
              <span className="side-filter-value">
                {year === 0 ? "New" : `≤${year}yr`}
              </span>
            </div>

            <input
              type="range"
              className="wiz-range-light"
              min={0}
              max={50}
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
              }
              style={{
                background: `linear-gradient(90deg, #1a1c22 ${paintPct(year, 0, 50)}%, rgba(0,0,0,0.12) ${paintPct(year, 0, 50)}%)`,
              }}
            />

            <div className="side-filter-labels">
              <span>New</span>
              <span>≤50yr</span>
            </div>
          </div>

          <div className="side-filter">
            <div className="side-filter-label">
              Urgency
              <span className="side-filter-value">
                {urgency} month{urgency === 1 ? "" : "s"}
              </span>
            </div>

            <input
              type="range"
              className="wiz-range-light"
              min={1}
              max={12}
              value={urgency}
              onChange={(event) =>
                setUrgency(Number(event.target.value))
              }
              style={{
                background: `linear-gradient(90deg, #1a1c22 ${paintPct(urgency, 1, 12)}%, rgba(0,0,0,0.12) ${paintPct(urgency, 1, 12)}%)`,
              }}
            />

            <div className="side-filter-labels">
              <span>1 month</span>
              <span>12 months</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-sharp btn-silver"
            disabled={sfSelected.length < SF_COMPARE_MIN}
            style={{
              opacity: sfSelected.length < SF_COMPARE_MIN ? 0.55 : 1,
              cursor:
                sfSelected.length < SF_COMPARE_MIN
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={() => onOpenCompare(sfSelected)}
          >
            ⧉ Compare
            {sfSelected.length
              ? ` (${sfSelected.length}/${SF_COMPARE_MAX})`
              : ""}
          </button>
        </div>

        <div className="wiz-assets-lists">
          <CarouselRow
            title="Featured"
            small
            headClassName="assets-header"
          >
            {sfFeatured.map((item) => (
              <AssetCard
                key={item.name}
                name={item.name}
                cat={item.cat}
                year={item.year}
                image={item.image}
                small
                minimal
                selected={isSelected(item.name)}
                onClick={() => handleAssetClick(item)}
              />
            ))}
          </CarouselRow>

          <CarouselRow title="Alternative Options" small>
            {sfAlternative.map((item) => (
              <AssetCard
                key={item.name}
                name={item.name}
                cat={item.cat}
                year={item.year}
                image={item.image}
                small
                minimal
                selected={isSelected(item.name)}
                onClick={() => handleAssetClick(item)}
              />
            ))}
          </CarouselRow>

          <CarouselRow title="Additional Selection" small>
            {sfAdditional.map((item) => (
              <AssetCard
                key={item.name}
                name={item.name}
                cat={item.cat}
                year={item.year}
                image={item.image}
                small
                minimal
                selected={isSelected(item.name)}
                onClick={() => handleAssetClick(item)}
              />
            ))}
          </CarouselRow>
        </div>
      </div>
    </div>
  );
}
