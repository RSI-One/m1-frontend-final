"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_PHRASES = [
  "Search manufacturers, models, variants…",
  'Try "Gulfstream G800"',
  'Try "Bombardier Global 8000"',
  'Try "ACJ320neo"',
  'Try "Jet under 10 Million"',
  'Try "5200 nm range"',
  'Try "13 passenger jet"',
];

/**
 * Cycles example searches into a text input's placeholder, one character
 * at a time — mirrors the initTypewriter() behaviour from the static
 * marketing page. Pauses automatically whenever the input is focused or
 * has a value, so it never fights with the user's own typing.
 */
export function useTypewriterPlaceholder(
  inputRef: React.RefObject<HTMLInputElement>,
  active: boolean,
  hasValue: boolean,
  phrases: string[] = DEFAULT_PHRASES
) {
  const [placeholder, setPlaceholder] = useState(phrases[0]);
  const hasValueRef = useRef(hasValue);
  hasValueRef.current = hasValue;

  useEffect(() => {
    if (!active) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const input = inputRef.current;
      const focused = typeof document !== "undefined" && document.activeElement === input;
      if (focused || hasValueRef.current) {
        timer = setTimeout(tick, 600);
        return;
      }

      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        setPlaceholder(current.slice(0, charIndex));
        if (charIndex === current.length) {
          deleting = true;
          timer = setTimeout(tick, 1400);
          return;
        }
        timer = setTimeout(tick, 55);
      } else {
        charIndex--;
        setPlaceholder(current.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          timer = setTimeout(tick, 400);
          return;
        }
        timer = setTimeout(tick, 28);
      }
    };

    tick();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return placeholder;
}
