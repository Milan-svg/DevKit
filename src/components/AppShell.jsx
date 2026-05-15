import { useState, useEffect, useMemo } from "react";
import { Toaster } from "sonner";
import Sidebar from "./Sidebar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import {
  Braces,
  Regex,
  Palette,
  Hash,
  Search,
  Command,
  Help,
} from "./Icons.jsx";
import JsonPlaceholder from "./tools/json/JsonPlaceholder.jsx";
import RegexPlaceholder from "./tools/regex/RegexPlaceholder.jsx";
import ColorTool from "./tools/color/ColorTool.jsx";
import HashPlaceholder from "./tools/hash/HashPlaceholder.jsx";

const TOOLS = [
  {
    id: "json",
    name: "JSON Formatter",
    subtitle: "Validate, pretty-print, and diff JSON in real time.",
    Icon: Braces,
    Component: JsonPlaceholder,
  },
  {
    id: "regex",
    name: "Regex Tester",
    subtitle: "Live-highlighted matches with flags, groups, and replace.",
    Icon: Regex,
    Component: RegexPlaceholder,
  },
  {
    id: "color",
    name: "Color Toolkit",
    subtitle: "Synced color inputs, palettes, and WCAG contrast.",
    Icon: Palette,
    Component: ColorTool,
  },
  {
    id: "hash",
    name: "Base64 & Hash",
    subtitle: "Encoders, JWT decoder, and crypto digest tools.",
    Icon: Hash,
    Component: HashPlaceholder,
  },
];

export default function AppShell() {
  const [active, setActive] = useState("color");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("devkit-theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("devkit-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= TOOLS.length) {
        e.preventDefault();
        setActive(TOOLS[n - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tool = useMemo(() => TOOLS.find((t) => t.id === active), [active]);

  return (
    <>
      <div className="app" data-tool={active}>
        <Sidebar tools={TOOLS} active={active} onSelect={setActive} />
        <main className="main">
          <div className="titlebar">
            <div>
              <h1>{tool.name}</h1>
              <p>{tool.subtitle}</p>
            </div>
            <div className="titlebar-actions">
              <ThemeToggle theme={theme} onTheme={setTheme} />
              <span className="titlebar-divider" aria-hidden="true" />
              <button className="iconbtn" title="Search (⌘K)">
                <Search />
              </button>
              <button className="iconbtn" title="Command palette">
                <Command />
              </button>
              <button className="iconbtn" title="Help">
                <Help />
              </button>
            </div>
          </div>
          <div className="content">
            {TOOLS.map(({ id, Component }) => (
              <div
                key={id}
                className={active === id ? "tool-enter" : ""}
                style={{ display: active === id ? "block" : "none" }}
              >
                <Component />
              </div>
            ))}
          </div>
        </main>
      </div>
      <Toaster position="bottom-center" theme={theme} />
    </>
  );
}
