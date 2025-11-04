import {
  Button,
  IconButton,
  Progress,
  Typography,
} from "@material-tailwind/react";
import JSZip from "jszip";
import {
  AArrowDownIcon,
  AArrowUpIcon,
  CaseLowerIcon,
  ChevronLeftIcon,
  PauseIcon,
  PlayIcon,
  WholeWordIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ComponentRenderer from "./components/ComponentRenderer";
import { getBook, getResourceAsBlob } from "./firebase";
import { MODE, useAudioPlayer, useLearnReading } from "./store";

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
    cacheAudio,
    setCacheAudio,
  } = useLearnReading();

  const { isPlaying, setIsPlaying } = useAudioPlayer();
  // const [indexPlay, setIndexPlay] = useState(0);
  const currentPlaying = useRef(false);
  const indexPlay = useRef(0);

  const [page, setPage] = useState(0);
  const [isStart, setIsStart] = useState(false);

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

  const handleToggleMode = useCallback(() => {
    currentPlaying.current = false;
    indexPlay.current = 0;
    toggleMode();
  }, []);

  const handlePlayAudio = useCallback(async () => {
    if (isPlaying) {
      currentPlaying.current = false;

      return;
    }
    const words = document.querySelectorAll(".words");
    currentPlaying.current = true;

    setIsPlaying(true);
    try {
      for (const [key, word] of Object.entries(words)) {
        if (!currentPlaying.current) {
          break;
        }

        if (indexPlay.current > 0 && key < indexPlay.current) {
          continue;
        }

        word.classList.add("active");
        let name = word.innerText.replace(/[,.?!]/g, "").toLowerCase();
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

        if (word.innerText.search(/[,.?!]/g) === -1) {
          await new Promise((res) => setTimeout(res, 1000));
        } else {
          await new Promise((res) => setTimeout(res, 1500));
        }
        word.classList.remove("active");
        indexPlay.current += 1;

        if (key == words.length - 1) {
          indexPlay.current = 0;
        }
      }
    } finally {
      setIsPlaying(false);
      currentPlaying.current = false;
    }
  }, [audios, isPlaying]);

  const handlePrevPage = useCallback(() => {
    currentPlaying.current = false;
    indexPlay.current = 0;
    setPage((prev) => (prev === 0 ? 0 : prev - 1));
  }, [pages]);

  const handleNextPage = useCallback(() => {
    currentPlaying.current = false;
    indexPlay.current = 0;
    setPage((prev) => (prev > pages.length - 1 ? pages.length - 1 : prev + 1));
  }, [pages]);

  useEffect(() => {
    if (!pages) return;

    if (pages[page]) {
      const teks = getTextComponent(pages[page]);
      for (const text of teks) {
        if (text.syllables) {
          for (const syll of text.syllables) {
            syll.forEach((item) => {
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
      {!isStart && pages && (
        <div className="fixed h-full w-full bg-slate-50 flex flex-col justify-center items-center z-50">
          <div className="overflow-hidden rounded-xl mb-8 shadow-lg">
            <img src="/thumbnail-book.webp" width={240} height={240} />
          </div>
          <Button onClick={() => setIsStart(true)}>Buka Buku</Button>
        </div>
      )}

      <div className="mx-auto w-full bg-[#F0F7FF] h-[calc(100vh-72px)] px-1 mb-[64px]">
        {pages && (
          <div className="overflow-y-auto p-4">
            <ComponentRenderer data={pages[page]} />
          </div>
        )}
        {pages && (
          <div className="fixed bottom-0 left-[50%] translate-x-[-50%] flex w-full justify-between gap-2 p-4 bg-[#F0F7FF]">
            <IconButton
              onClick={handlePrevPage}
              disabled={page === 0}
              size="xl"
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton onClick={handleToggleMode} size="xl">
              {mode === MODE.LETTER ? <WholeWordIcon /> : <CaseLowerIcon />}
            </IconButton>
            <IconButton
              onClick={handlePlayAudio}
              size="xl"
              variant={isPlaying ? "outline" : "solid"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton onClick={handleDecreaseFont} size="xl">
              <AArrowDownIcon />
            </IconButton>
            <IconButton onClick={handleIncreaseFont} size="xl">
              <AArrowUpIcon />
            </IconButton>
            <IconButton
              onClick={handleNextPage}
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
    <div className="mx-auto flex flex-col gap-5 items-center justify-center w-full bg-[#F0F7FF] h-screen px-1">
      <Typography type="h1" as="h1" sx={{ fontSize: 32 }}>
        404
      </Typography>
      <Typography type="small">Not Found</Typography>
    </div>
  );
};

const LoadingPage = ({ onLoadData }) => {
  const { pageId } = useParams();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Menyiapkan...");

  const handleLoadData = useCallback(
    async (file) => {
      if (!file) return;
      try {
        let data = {};
        setStatus("Membuka file...");
        const zip = await JSZip.loadAsync(file, {
          onUpdate: (metadata) => {
            setProgress(metadata.percent);
          },
        });

        setProgress(100);
        setStatus("Memproses audio...");

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

        setStatus("Menyelesaikan...");
        const config = await zip.file("data.json").async("string");

        data["data"] = JSON.parse(config);
        data["audio"] = mapAudio;

        onLoadData(data);
      } catch (e) {
        window.alert("Terjadi error saat memuat data.");
        console.error(e);
        onLoadData(null);
      }
    },
    [onLoadData]
  );

  useEffect(() => {
    setStatus("Mengunduh data buku...");
    getBook(pageId)
      .then(async (bookData) => {
        if (!bookData) return onLoadData(null);

        if (bookData.url && bookData.id) {
          const fileBlob = await getResourceAsBlob(bookData.url, {
            onProgress: (progress) => {
              const percentCompleted = Math.floor(
                (progress.loaded * 100) / progress.total
              );
              setProgress(percentCompleted);
            },
          });
          handleLoadData(fileBlob);
        }
      })
      .catch((error) => {
        console.error("Error fetching book data:", error);
        onLoadData(null);
      });
  }, [pageId, handleLoadData, onLoadData]);

  return (
    <div className="mx-auto flex flex-col gap-5 items-center justify-center w-full bg-[#F0F7FF] h-screen px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <Typography color="blue-gray" variant="h6">
            {status}
          </Typography>
          <Typography color="blue-gray" variant="h6">
            {Math.round(progress)}%
          </Typography>
        </div>
        <Progress value={progress} color="blue" />
      </div>
    </div>
  );
};
