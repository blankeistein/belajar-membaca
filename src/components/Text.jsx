import clsx from "clsx";
import { Fragment, useCallback, useEffect, useMemo, useRef } from "react";
import { MODE, useAudioPlayer, useLearnReading } from "../store";
import { splitWords, splitWordsBySyllable } from "../utils";

export default function Text({ value, props, isSyllable = false }) {
  const { textProps, mode, audios, cacheAudio, setCacheAudio } =
    useLearnReading();
  const { isPlaying } = useAudioPlayer();

  const activeWord = useRef(null);
  const ref = useRef();
  const syllableText = useMemo(() => {
    if (mode === MODE.WORD) {
      return splitWords(value);
    } else {
      return splitWordsBySyllable(value);
    }
  }, [value, mode]);

  const playAudio = useCallback(
    (text) => {
      if (isPlaying) return;
      let name = text.replace(/[,.?!]/g, "").toLowerCase();

      let audio = cacheAudio[name];

      if (!audio) {
        audio = new Audio(audios[name.toLowerCase()]);

        setCacheAudio(name, audio);
        cacheAudio[name] = audio;

        audio.load();
      }

      audio.play().catch((error) => {
        console.error("Audio playback error:", error);
      });
    },
    [audios, isPlaying]
  );

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
  }, [isSyllable, mode, playAudio]);

  return (
    <>
      <div
        ref={ref}
        className={clsx(
          "flex font-bold gap-y-2 gap-x-4 flex-wrap select-none",
          props?.className
        )}
      >
        {syllableText.map((word, key) =>
          Array.isArray(word) ? (
            <div key={"word" + key} className="flex flex-wrap">
              {word.map((char, index) => (
                <Fragment key={char + index}>
                  <span
                    className={clsx(
                      "words text-xl pb-16 transition-all",
                      isSyllable && "px-2"
                    )}
                    style={{
                      fontSize: textProps.fontSize || 12,
                      paddingBottom: textProps.fontSize + 20 || 20,
                    }}
                  >
                    {char}
                  </span>
                  {isSyllable && index !== word.length - 1 && (
                    <span
                      className="text-xl pb-16"
                      style={{
                        fontSize: textProps.fontSize || 12,
                        paddingBottom: textProps.fontSize + 20 || 20,
                      }}
                    >
                      -
                    </span>
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            <span
              key={"word" + key}
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
