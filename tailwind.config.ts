import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      keyframes: {
        "loader-square": {
          "0%": {
            transform: "translate(0, 0)",
          },
          "25%": {
            transform: "translate(100%, 0)",
          },
          "50%": {
            transform: "translate(100%, 100%)",
          },
          "75%": {
            transform: "translate(0, 100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
      },
      animation: {
        "loader-square": "loader-square 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;