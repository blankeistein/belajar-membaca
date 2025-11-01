import { IconButton, Spinner, Typography } from "@material-tailwind/react";
import JSZip from "jszip";
import {
  AArrowDownIcon,
  AArrowUpIcon,
  CaseLowerIcon,
  ChevronLeftIcon,
  PlayIcon,
  WholeWordIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ComponentRenderer from "./components/ComponentRenderer";
import { getBook, getResourceAsBlob } from "./firebase";
import { MODE, useLearnReading } from "./store";

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

export default function Learn() {
  const {
    pages,
    audios,
    changeTextProps,
    textProps,
    mode,
    toggleMode,
    setAudio,
    setPages,
  } = useLearnReading();

  const [page, setPage] = useState(0);

  const handleIncreaseFont = useCallback(
    (newSize = null) => {
      if (typeof newSize == "number") {
        changeTextProps({ fontSize: newSize });
      } else {
        changeTextProps({ fontSize: textProps.fontSize + 2 });
      }
    },
    [textProps.fontSize, changeTextProps]
  );

  const handleDecreaseFont = useCallback(
    (newSize = null) => {
      if (typeof newSize == "number") {
        changeTextProps({ fontSize: newSize });
      } else {
        changeTextProps({ fontSize: textProps.fontSize - 2 });
      }
    },
    [textProps.fontSize, changeTextProps]
  );

  const handleLoadData = (config) => {
    if (config) {
      setAudio(config.audio);
      setPages(config.data);
    } else {
      setPages(null);
    }
  };

  useEffect(() => {
    if (!pages) return;

    if (pages[page]) {
      const teks = getTextComponent(pages[page]);
      for (const text of teks) {
        if (text.syllables) {
          for (const syll of text.syllables) {
            syll.forEach((item) => {
              console.log(item.replace(".", ""));
              const audio = new Audio(`/audio/${item.replace(".", "")}.mp3`);
              audio.preload = "auto";
            });
          }
        }
      }
    }
  }, [pages, page, audios]);

  if (pages === undefined) return <LoadingPage onLoadData={handleLoadData} />;

  if (pages === null) return <Page404 />;

  return (
    <>
      <div className="mx-auto w-full bg-[#F0F7FF] h-screen px-1 pb-[64px]">
        {pages && (
          <div className="overflow-y-auto p-4">
            <ComponentRenderer data={pages[page]} />
          </div>
        )}
        {pages && (
          <div className="fixed bottom-0 left-[50%] translate-x-[-50%] flex w-full justify-between gap-2 p-4">
            <IconButton
              onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
              disabled={page === 0}
              size="xl"
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton onClick={toggleMode} size="xl">
              {mode === MODE.LETTER ? <WholeWordIcon /> : <CaseLowerIcon />}
            </IconButton>
            <IconButton
              onClick={() => window.alert("Fitur masih dalam pengembangan")}
              size="xl"
            >
              <PlayIcon />
            </IconButton>
            <IconButton onClick={handleDecreaseFont} size="xl">
              <AArrowDownIcon />
            </IconButton>
            <IconButton onClick={handleIncreaseFont} size="xl">
              <AArrowUpIcon />
            </IconButton>
            <IconButton
              onClick={() =>
                setPage((prev) =>
                  prev > pages.length - 1 ? pages.length - 1 : prev + 1
                )
              }
              disabled={page >= pages.length - 1}
              size="xl"
            >
              <ChevronLeftIcon className="-scale-x-100" />
            </IconButton>
          </div>
        )}
      </div>
    </>
  );
}

const Page404 = () => {
  return (
    <div className="mx-auto flex flex-col gap-5 items-center justify-center max-w-lg w-full bg-[#F0F7FF] h-screen px-1">
      <Typography type="small">Not Found</Typography>
    </div>
  );
};

const LoadingPage = ({ onLoadData }) => {
  const { pageId } = useParams();

  useEffect(() => {
    getBook(pageId)
      .then(async (bookData) => {
        if (!bookData) return onLoadData(null);

        if (bookData.url && bookData.id) {
          const fileBlob = await getResourceAsBlob(bookData.url);
          handleLoadData(fileBlob);
        }
      })
      .catch((error) => {
        console.error("Error fetching book data:", error);
      });
  }, [pageId, handleLoadData, onLoadData]);

  const handleLoadData = useCallback(
    async (file) => {
      if (!file) return;
      try {
        let data = {};
        const zip = await JSZip.loadAsync(file);
        const mapAudio = {};
        const audios = zip.folder("audio");

        for (const file of Object.values(audios.files)) {
          if (file.name.startsWith("audio/") && !file.dir) {
            let filename = file.name.replace("audio/", "");
            let key = filename.replace(".mp3", "");

            const blob = await file.async("blob");
            mapAudio[key] = URL.createObjectURL(blob);
          }
        }

        const config = await zip.file("data.json").async("string");

        data["data"] = JSON.parse(config);
        data["audio"] = mapAudio;

        onLoadData(data);
      } catch (e) {
        window.alert("Terjadi error");
        console.error(e);
      }
    },
    [onLoadData]
  );

  return (
    <div className="mx-auto flex flex-col gap-5 items-center justify-center w-full bg-[#F0F7FF] h-screen px-1">
      <Spinner />
      <Typography type="small">Memuat data</Typography>
    </div>
  );
};
