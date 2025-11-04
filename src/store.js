import { create } from "zustand";

export const MODE = {
  WORD: "word",
  LETTER: "letter",
};

export const useLearnReading = create((set) => ({
  mode: MODE.LETTER,
  textProps: {
    fontSize: 24,
  },
  pages: undefined,
  audios: {},
  cacheAudio: {},

  toggleMode: () => {
    set((state) => {
      if (state.mode === MODE.LETTER) {
        return { ...state, mode: MODE.WORD };
      } else {
        return { ...state, mode: MODE.LETTER };
      }
    });
  },

  setMode: (mode) => {
    set({ mode });
  },

  changeTextProps: (props) => {
    set((state) => {
      if (props.fontSize && props.fontSize < 16) {
        props.fontSize = 16;
      }

      if (props.fontSize && props.fontSize > 50) {
        props.fontSize = 50;
      }

      return {
        ...state,
        textProps: { ...state.textProps, ...props },
      };
    });
  },

  setPages: (pages) => {
    if (!pages) {
      set({ pages: null });
    } else {
      const newPages = pages.map((page) => {
        return addMissingIds(page);
      });

      set({ pages: newPages });
    }
  },

  setAudio: (audio) => {
    set((state) => {
      state.audios = audio;

      return { ...state, audios: audio };
    });
  },

  setCacheAudio: (name, audio) => {
    set((state) => {
      return { ...state, cacheAudio: { ...state.cacheAudio, [name]: audio } };
    });
  },
}));

export const useAudioPlayer = create((set) => ({
  isPlaying: false,

  setIsPlaying: (state) => set({ isPlaying: state }),
}));

export const generateUniqueId = () =>
  "id-" + Math.random().toString(36).substring(2, 9);

function addMissingIds(component) {
  if (typeof component === "object" && component != null) {
    if (!component["id"]) {
      component["id"] = generateUniqueId();

      if (Array.isArray(component.childrens)) {
        component.childrens = component.childrens.map(addMissingIds);
      }
    }
  }

  return component;
}
