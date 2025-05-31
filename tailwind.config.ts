import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    fontFamily: {
      second: "Manrope",
      poppins: "Poppins",
      inter: "Inter"
    },
    extend: {
      filter: ["hover", "focus"],
      screens: {
        xl: { max: "1700px" },
        laptop: { max: "1280px" },
        tablet: { max: "768px" },
        mobile: { max: "480px" }
      },
      backgroundImage: {
        header: "url('/header.png')",
        gallery: "url('/galleryCenter.png')",
        hands: "url('/hands.png')"
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        grey: "#eeeeee",
        bgPrimary: "#E8E8E8",
        bgPrimary2: "#f2f2f2",
        bgSecondary: "#ededed",
        borderColor: "#aeab9c",
      }
    }
  },
  plugins: []
} satisfies Config;
