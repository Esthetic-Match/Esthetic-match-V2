import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
keyframes: {
   "em-bar": {
     "0%, 100%": { transform: "scaleY(0.35)", opacity: "0.3" },
     "50%":      { transform: "scaleY(1)",    opacity: "1"   },
   },
   "em-dot": {
     "0%, 80%, 100%": { opacity: "0.2", transform: "scale(0.6)" },
     "40%":           { opacity: "1",   transform: "scale(1)"   },
   },
 },
 animation: {
   "em-bar-1": "em-bar 1.4s ease-in-out infinite",
   "em-bar-2": "em-bar 1.4s ease-in-out 0.15s infinite",
   "em-bar-3": "em-bar 1.4s ease-in-out 0.30s infinite",
   "em-bar-4": "em-bar 1.4s ease-in-out 0.45s infinite",
   "em-bar-5": "em-bar 1.4s ease-in-out 0.60s infinite",
   "em-dot-1": "em-dot 1.4s ease-in-out infinite",
   "em-dot-2": "em-dot 1.4s ease-in-out 0.20s infinite",
   "em-dot-3": "em-dot 1.4s ease-in-out 0.40s infinite",
 },
    },
  },
  plugins: [],
};

export default config;