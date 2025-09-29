import clsx from "clsx";
import { useEffect, useMemo, useRef } from "react";
import { MODE, useLearnReading } from "../store";

function playAudio(text) {
  let name = text.replace(".", "");
  const audio = new Audio(`/audio/${name}.mp3`);
  audio.onloadedmetadata = () => {
    audio.play();
  };
}

export default function Text({ value, props, isSyllable = false }) {
  const { textProps, mode } = useLearnReading();

  const activeWord = useRef(null);
  const ref = useRef();
  const syllableText = useMemo(() => {
    if (mode === MODE.WORD) {
      return splitWords(value);
    } else {
      return splitWordsBySyllable(value);
    }
  }, [value, mode]);

  useEffect(() => {
    if (!ref.current) return;

    const hoverElement = ["text-blue-600", "z-10"];
    if (isSyllable) {
      hoverElement.push("scale-125");
    }

    const handleInteractive = (event) => {
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      const targetElement = document.elementFromPoint(clientX, clientY);
      if (
        targetElement &&
        targetElement.classList.contains("words") &&
        targetElement !== activeWord.current
      ) {
        targetElement.classList.add(...hoverElement);

        if (activeWord.current) {
          activeWord.current.classList.remove(...hoverElement);
        }
        activeWord.current = targetElement;
        playAudio(targetElement.innerText);
      } else if (!targetElement.classList.contains("words")) {
        if (activeWord.current) {
          activeWord.current.classList.remove(...hoverElement);
        }
        activeWord.current = null;
      }
    };

    const handleTouchEnd = () => {
      if (activeWord.current) {
        activeWord.current.classList.remove(...hoverElement);
        activeWord.current = null;
      }
    };

    const element = ref.current;
    element.addEventListener("mousemove", handleInteractive);
    element.addEventListener("touchstart", handleInteractive);
    element.addEventListener("touchmove", handleInteractive);
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("mousemove", handleInteractive);
      element.removeEventListener("touchstart", handleInteractive);
      element.removeEventListener("touchmove", handleInteractive);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isSyllable, mode]);

  return (
    <>
      <div
        ref={ref}
        className={clsx(
          "flex font-bold gap-y-2 gap-x-4 flex-wrap select-none",
          props?.className
        )}
      >
        {syllableText.map((word) =>
          Array.isArray(word) ? (
            <div className="flex flex-wrap">
              {word.map((char, index) => (
                <>
                  <span
                    className={clsx(
                      "words text-xl pb-5 transition-all",
                      isSyllable && "px-2"
                    )}
                    style={{
                      fontSize: textProps.fontSize || 12,
                      paddingBottom: textProps.fontSize || 20,
                    }}
                  >
                    {char}
                  </span>
                  {isSyllable && index !== word.length - 1 && (
                    <span
                      className="text-xl pb-5"
                      style={{
                        fontSize: textProps.fontSize || 12,
                        paddingBottom: textProps.fontSize || 20,
                      }}
                    >
                      -
                    </span>
                  )}
                </>
              ))}
            </div>
          ) : (
            <span
              className="words text-xl pb-5 transition-all"
              style={{
                fontSize: textProps?.fontSize || 12,
                paddingBottom: textProps.fontSize || 20,
              }}
            >
              {word}
            </span>
          )
        )}
      </div>
    </>
  );
}

const VOWELS = new Set(["a", "i", "u", "e", "o"]);
const DIGRAPHS = ["ng", "ny", "sy", "kh"];
const DIPHTHONGS = ["ai", "au", "oi"];

function isVowel(ch) {
  return VOWELS.has(ch);
}
function startsWithDigraph(s) {
  return DIGRAPHS.some((d) => s.startsWith(d));
}

function syllabifyWord(word) {
  const lower = word.toLowerCase();
  const chars = [...word]; // simpan huruf asli
  const charsLower = [...lower]; // untuk logika
  const out = [];
  let i = 0;

  while (i < chars.length) {
    // onset
    let onset = "";
    while (i < chars.length && !isVowel(charsLower[i])) {
      onset += chars[i++]; // pakai huruf asli
    }

    // nucleus
    let nucleus = "";
    if (i < chars.length && isVowel(charsLower[i])) {
      if (i + 1 < chars.length) {
        const two = charsLower[i] + charsLower[i + 1];
        if (DIPHTHONGS.includes(two)) {
          nucleus = chars[i] + chars[i + 1]; // huruf asli
          i += 2;
        } else {
          nucleus = chars[i++];
        }
      } else {
        nucleus = chars[i++];
      }
    }

    if (nucleus === "") {
      if (out.length) out[out.length - 1] += onset;
      else out.push(onset);
      break;
    }

    // cluster konsonan
    const consStart = i;
    while (i < chars.length && !isVowel(charsLower[i])) i++;
    const cluster = chars.slice(consStart, i).join("");
    const clusterLower = charsLower.slice(consStart, i).join("");

    if (i === chars.length) {
      out.push(onset + nucleus + cluster);
      break;
    }

    if (cluster.length === 0) {
      out.push(onset + nucleus);
    } else if (cluster.length === 1) {
      out.push(onset + nucleus);
      i = consStart;
    } else {
      if (startsWithDigraph(clusterLower)) {
        out.push(onset + nucleus);
        i = consStart;
      } else {
        out.push(onset + nucleus + cluster[0]);
        i = consStart + 1;
      }
    }
  }
  return out;
}

export function splitWordsBySyllable(sentence) {
  const words = sentence.split(" ");

  const result = words.map((word) => {
    return syllabifyWord(word);
  });

  return result;
}

export function splitWords(sentence) {
  const words = sentence.split(" ");
  console.log(words);
  return words;
}
