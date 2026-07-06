/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  safelist: [
    "bg-emerald-500",
    "bg-indigo-600",
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-violet-600",
    "bg-orange-500",
    "bg-slate-100",
    "text-slate-600",
  ],
  theme: {
    extend: {
      borderRadius: {
        card: "2rem",
        modal: "2.5rem",
      },
      maxWidth: {
        app: "1400px",
      },
      zIndex: {
        drawer: "70",
        modal: "100",
        confirm: "1000",
      },
    },
  },
  plugins: [],
};
