
import { useEffect, useRef, useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";

const themes = [
  { name: "cipher", label: "CIPHER Signature", colors: ["#3857d6", "#f17b50", "#f5ca61"] },
  { name: "light", label: "Light", colors: ["#ffffff", "#e5e7eb", "#64748b"] },
  { name: "dark", label: "Dark", colors: ["#1d232a", "#7480ff", "#a6adbb"] },
  { name: "cupcake", label: "Cupcake", colors: ["#faf7f5", "#65c3c8", "#ef9fbc"] },
  { name: "bumblebee", label: "Bumblebee", colors: ["#ffffff", "#e0a82e", "#f9d72f"] },
  { name: "emerald", label: "Emerald", colors: ["#ffffff", "#66cc8a", "#377cfb"] },
  { name: "corporate", label: "Corporate", colors: ["#ffffff", "#4b6bfb", "#7b92b2"] },
  { name: "synthwave", label: "Synthwave", colors: ["#1a103d", "#e779c1", "#58c7f3"] },
  { name: "retro", label: "Retro", colors: ["#ece3ca", "#ef9995", "#a4cbb4"] },
  { name: "cyberpunk", label: "Cyberpunk", colors: ["#ffee00", "#ff7598", "#75d1f0"] },
  { name: "valentine", label: "Valentine", colors: ["#f0d6e8", "#e96d7b", "#a991f7"] },
  { name: "halloween", label: "Halloween", colors: ["#212121", "#f28c18", "#6d3a9c"] },
  { name: "garden", label: "Garden", colors: ["#e9e7e7", "#5c7f67", "#ec4899"] },
  { name: "forest", label: "Forest", colors: ["#171c19", "#1eb854", "#1db88e"] },
  { name: "aqua", label: "Aqua", colors: ["#345da7", "#09ecf3", "#966fb3"] },
  { name: "lofi", label: "Lo-Fi", colors: ["#ffffff", "#808080", "#242424"] },
  { name: "pastel", label: "Pastel", colors: ["#ffffff", "#d1c1d7", "#f6cbd1"] },
  { name: "fantasy", label: "Fantasy", colors: ["#ffffff", "#6e0b75", "#007ebd"] },
  { name: "wireframe", label: "Wireframe", colors: ["#ffffff", "#b8b8b8", "#000000"] },
  { name: "black", label: "Black", colors: ["#000000", "#343232", "#ffffff"] },
  { name: "luxury", label: "Luxury", colors: ["#09090b", "#c8a96b", "#ffffff"] },
  { name: "dracula", label: "Dracula", colors: ["#282a36", "#ff79c6", "#bd93f9"] },
  { name: "cmyk", label: "CMYK", colors: ["#ffffff", "#45aeee", "#e8488a"] },
  { name: "autumn", label: "Autumn", colors: ["#f1f1f1", "#8c0327", "#d85251"] },
  { name: "business", label: "Business", colors: ["#202020", "#1c4e80", "#7c909a"] },
  { name: "acid", label: "Acid", colors: ["#fafafa", "#ff00ff", "#ffca00"] },
  { name: "lemonade", label: "Lemonade", colors: ["#ffffff", "#519903", "#e9e92f"] },
  { name: "night", label: "Night", colors: ["#0f1729", "#38bdf8", "#818cf8"] },
  { name: "coffee", label: "Coffee", colors: ["#20161f", "#db924b", "#a7a58e"] },
  { name: "winter", label: "Winter", colors: ["#ffffff", "#047aff", "#463aa2"] },
  { name: "dim", label: "Dim", colors: ["#2a303c", "#9fe88d", "#ff9f9f"] },
  { name: "nord", label: "Nord", colors: ["#eceff4", "#5e81ac", "#88c0d0"] },
  { name: "sunset", label: "Sunset", colors: ["#1e293b", "#ff865b", "#fdcaa5"] },
  { name: "caramellatte", label: "Caramel Latte", colors: ["#f7f3e9", "#a66b42", "#d5b48c"] },
  { name: "abyss", label: "Abyss", colors: ["#001e3c", "#00a8cc", "#7856ff"] },
  { name: "silk", label: "Silk", colors: ["#e9e5e0", "#a38f84", "#d0c5ba"] },
];

function ThemeSwitcher() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cipher-theme") || "cipher"
  );

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cipher-theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="theme-trigger"
        aria-expanded={open}
        aria-label="Choose appearance theme"
      >
        <Palette size={19} />
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="theme-panel">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-bold">Appearance</p>
              <p className="mt-1 text-xs opacity-60">
                Choose your atmosphere
              </p>
            </div>
            <span className="theme-live-dot" />
          </div>

          <div className="theme-list">
            {themes.map((item) => (
              <button
                type="button"
                key={item.name}
                onClick={() => {
                  setTheme(item.name);
                  setOpen(false);
                }}
                className={`theme-option ${
                  theme === item.name ? "theme-option-active" : ""
                }`}
                aria-pressed={theme === item.name}
              >
                <span className="theme-swatches">
                  {item.colors.map((color, index) => (
                    <span
                      key={index}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>

                <span className="flex-1 text-left">
                  {item.label}
                </span>

                {theme === item.name && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-base-300 px-4 py-3">
            <p className="text-[10px] text-base-content/50">
              {themes.length} visual experiences · CIPHER
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
