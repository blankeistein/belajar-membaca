import { IconButton } from "@material-tailwind/react";
import { AArrowDownIcon, AArrowUpIcon, ChevronLeftIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ComponentRenderer from "./components/ComponentRenderer";
import { splitWordsBySyllable } from "./components/Text";
import { useLearnReading } from "./store";

function getTextComponent(component) {
  const text = [];
  if (component.type === "Text") {
    text.push(component);
  }

  if (component.childrens) {
    component.childrens.forEach((child) =>
      getTextComponent(child).forEach((item) => text.push(item))
    );
  }

  return text;
}

const data = [
  {
    type: "Row",
    props: { className: "p-5 gap-10" },
    childrens: [
      {
        type: "Text",
        props: { className: "text-left" },
        isSyllable: false,
        value:
          "baju itu berwarna merah. rambutnya berwarna pink. tasku berwarna hitam.",
        syllables: splitWordsBySyllable(
          "baju itu berwarna merah. rambutnya berwarna pink. tasku berwarna hitam."
        ),
      },
      {
        type: "Text",
        props: { className: "text-left" },
        isSyllable: true,
        value:
          "baju itu berwarna merah. rambutnya berwarna pink. tasku berwarna hitam.",
        syllables: splitWordsBySyllable(
          "baju itu berwarna merah. rambutnya berwarna pink. tasku berwarna hitam."
        ),
      },
    ],
  },
  {
    type: "Column",
    props: { className: "pt-5 grid grid-cols-2" },
    childrens: [
      {
        type: "Text",
        props: {},
        value: "darah itu merah jenderal.",
      },
      {
        type: "Text",
        props: {},
        value: "Baju itu putih.",
      },
    ],
  },
];

export default function Learn() {
  const { changeTextProps, textProps } = useLearnReading();
  const [page, setPage] = useState(0);

  const handleIncreaseFont = useCallback(
    (newSize = null) => {
      if (typeof newSize == "number") {
        changeTextProps({ fontSize: newSize });
      } else {
        changeTextProps({ fontSize: textProps.fontSize + 2 });
      }
    },
    [textProps.fontSize]
  );

  const handleDecreaseFont = useCallback(
    (newSize = null) => {
      if (typeof newSize == "number") {
        changeTextProps({ fontSize: newSize });
      } else {
        changeTextProps({ fontSize: textProps.fontSize - 2 });
      }
    },
    [textProps.fontSize]
  );

  useEffect(() => {
    if (data[page]) {
      // console.log(data[page]);
      const teks = getTextComponent(data[page]);
      for (const text of teks) {
        if (text.syllables) {
          for (const syll of text.syllables) {
            syll.forEach((item) => {
              const audio = new Audio(`/audio/${item.replace(".", "")}.mp3`);
              audio.preload = true;
            });
          }
        }
      }
    }
  }, [page]);

  return (
    <>
      <div className="mx-auto grid grid-rows-[max-content_1fr_max-content] max-w-lg w-full bg-[#F0F7FF] h-screen px-1">
        <div className="flex gap-2"></div>
        <div className="overflow-y-auto">
          <ComponentRenderer data={data[page]} />
        </div>
        <div className="flex justify-between gap-2 p-1">
          <IconButton
            onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
            disabled={page === 0}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleDecreaseFont}>
            <AArrowDownIcon />
          </IconButton>
          <IconButton onClick={handleIncreaseFont}>
            <AArrowUpIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              setPage((prev) =>
                prev > data.length - 1 ? data.length - 1 : prev + 1
              )
            }
            disabled={page >= data.length - 1}
          >
            <ChevronLeftIcon className="-scale-x-100" />
          </IconButton>
        </div>
      </div>
    </>
  );
}
