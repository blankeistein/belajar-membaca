import { create } from "zustand";

export const MODE = {
  WORD: "word",
  LETTER: "letter",
};

export const useLearnReading = create((set, get) => ({
  mode: MODE.LETTER,
  textProps: {
    fontSize: 20,
  },

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
}));
