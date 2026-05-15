import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import Panel from "../../Panel.jsx";
import Slider from "./Slider.jsx";
import CopyChip from "./CopyChip.jsx";
import PaletteCard from "./PaletteCard.jsx";
import ContrastBadge from "./ContrastBadge.jsx";
import { Shuffle, Sparkles, Copy } from "../../Icons.jsx";
import {
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  parseCss,
  isLight,
  contrastRatio,
  shadeScale,
  harmony,
  fixForegroundContrast,
  paletteToCss,
  COLOR_PRESETS,
  HARMONY_DESCRIPTIONS,
} from "../../../lib/colorUtils.js";

export default function ColorTool() {
  const [rgb, setRgb] = useState({ r: 10, g: 132, b: 255 });
  const [hexInput, setHexInput] = useState("0A84FF");
  const [hexValid, setHexValid] = useState(true);
  const [bgRgb, setBgRgb] = useState({ r: 245, g: 245, b: 247 });
  const [activeTarget, setActiveTarget] = useState("fg");
  const [activeHarmony, setActiveHarmony] = useState("complementary");

  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const hex = useMemo(() => rgbToHex(rgb), [rgb]);
  const onLight = isLight(rgb);

  const activeRgb = activeTarget === "fg" ? rgb : bgRgb;

  useEffect(() => {
    setHexInput(rgbToHex(activeRgb).replace("#", ""));
    setHexValid(true);
  }, [activeRgb.r, activeRgb.g, activeRgb.b, activeTarget]);

  const setActiveColor = (next) => {
    if (activeTarget === "fg") setRgb(next);
    else setBgRgb(next);
  };

  const onHexChange = (raw) => {
    setHexInput(raw);
    const parsed = parseCss(raw.startsWith("#") ? raw : "#" + raw);
    if (parsed) {
      setActiveColor(parsed);
      setHexValid(true);
    } else setHexValid(false);
  };

  const setR = (r) => setActiveColor({ ...activeRgb, r });
  const setG = (g) => setActiveColor({ ...activeRgb, g });
  const setB = (b) => setActiveColor({ ...activeRgb, b });
  const setH = (h) => setActiveColor(hslToRgb({ ...rgbToHsl(activeRgb), h }));
  const setS = (s) => setActiveColor(hslToRgb({ ...rgbToHsl(activeRgb), s }));
  const setL = (l) => setActiveColor(hslToRgb({ ...rgbToHsl(activeRgb), l }));

  const swap = () => {
    const a = rgb,
      b = bgRgb;
    setRgb(b);
    setBgRgb(a);
  };

  const ratio = useMemo(() => contrastRatio(rgb, bgRgb), [rgb, bgRgb]);
  const ratioStr = ratio >= 10 ? ratio.toFixed(1) : ratio.toFixed(2);

  const shades = useMemo(() => shadeScale(rgb), [rgb]);
  const comp = useMemo(() => harmony(rgb, "complementary"), [rgb]);
  const ana = useMemo(() => harmony(rgb, "analogous"), [rgb]);
  const tri = useMemo(() => harmony(rgb, "triadic"), [rgb]);
  const spl = useMemo(() => harmony(rgb, "split"), [rgb]);

  const cssVars = useMemo(() => {
    const lines = [];
    lines.push([" --color-base", hex]);
    shades.forEach((s, i) =>
      lines.push(["  --color-" + (i + 1) * 100, rgbToHex(s)]),
    );
    [
      ["--color-complement", comp[1]],
      ["--color-triad-2", tri[1]],
      ["--color-triad-3", tri[2]],
    ].forEach(([k, v]) => lines.push([" " + k, rgbToHex(v)]));
    return lines;
  }, [hex, shades, comp, tri]);

  const _hsl = rgbToHsl(activeRgb);
  const rFill = `linear-gradient(90deg, rgb(0,${activeRgb.g},${activeRgb.b}), rgb(255,${activeRgb.g},${activeRgb.b}))`;
  const gFill = `linear-gradient(90deg, rgb(${activeRgb.r},0,${activeRgb.b}), rgb(${activeRgb.r},255,${activeRgb.b}))`;
  const bFill = `linear-gradient(90deg, rgb(${activeRgb.r},${activeRgb.g},0), rgb(${activeRgb.r},${activeRgb.g},255))`;
  const hFill = `linear-gradient(90deg, hsl(0 ${_hsl.s}% ${_hsl.l}%), hsl(60 ${_hsl.s}% ${_hsl.l}%), hsl(120 ${_hsl.s}% ${_hsl.l}%), hsl(180 ${_hsl.s}% ${_hsl.l}%), hsl(240 ${_hsl.s}% ${_hsl.l}%), hsl(300 ${_hsl.s}% ${_hsl.l}%), hsl(360 ${_hsl.s}% ${_hsl.l}%))`;
  const sFill = `linear-gradient(90deg, hsl(${_hsl.h} 0% ${_hsl.l}%), hsl(${_hsl.h} 100% ${_hsl.l}%))`;
  const lFill = `linear-gradient(90deg, #000, hsl(${_hsl.h} ${_hsl.s}% 50%), #fff)`;

  const harmonySet =
    activeHarmony === "complementary"
      ? comp
      : activeHarmony === "analogous"
        ? ana
        : activeHarmony === "triadic"
          ? tri
          : spl;
  const harmonyMeta = HARMONY_DESCRIPTIONS[activeHarmony];
  const passes = ratio >= 4.5;

  return (
    <div className="placeholder">
      <div className="color-grid">
        {/* editor */}
        <Panel title="Color editor" chips={["hex", "rgb", "hsl"]}>
          <div
            className="swatch-hero"
            data-on-light={onLight ? "1" : "0"}
            style={{ background: hex }}
          >
            <div className="swatch-meta">
              <span>{hex}</span>
              <span style={{ opacity: 0.7 }}>·</span>
              <span>
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </span>
              <span style={{ opacity: 0.7 }}>·</span>
              <span>
                hsl({hsl.h} {hsl.s}% {hsl.l}%)
              </span>
            </div>
            <CopyChip value={hex} />
          </div>

          <div className="hex-row">
            <div className={"hex-input " + (hexValid ? "" : "invalid")}>
              <span className="hex-hash">#</span>
              <input
                value={hexInput}
                onChange={(e) => onHexChange(e.target.value)}
                placeholder="0A84FF or rgb(…) or hsl(…) or 'tomato'"
                spellCheck="false"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="preset-row">
            <span className="preset-label">Presets</span>
            {COLOR_PRESETS.map((p) => {
              const fg = parseCss(p.fg),
                bg = parseCss(p.bg);
              return (
                <button
                  key={p.id}
                  className="preset"
                  onClick={() => {
                    setRgb(fg);
                    setBgRgb(bg);
                  }}
                  title={`${p.name} — ${p.fg} on ${p.bg}`}
                >
                  <span className="pp" style={{ background: p.bg }} />
                  <span className="pp" style={{ background: p.fg }} />
                  <span className="preset-name">{p.name}</span>
                </button>
              );
            })}
          </div>

          <div className="slider-group">
            <h4>
              RGB{" "}
              <span className="group-vals">
                {activeRgb.r}, {activeRgb.g}, {activeRgb.b}
              </span>
            </h4>
            <div className="slider-row">
              <span className="lbl">R</span>
              <Slider value={activeRgb.r} onChange={setR} fill={rFill} />
              <span className="num">{activeRgb.r}</span>
            </div>
            <div className="slider-row">
              <span className="lbl">G</span>
              <Slider value={activeRgb.g} onChange={setG} fill={gFill} />
              <span className="num">{activeRgb.g}</span>
            </div>
            <div className="slider-row">
              <span className="lbl">B</span>
              <Slider value={activeRgb.b} onChange={setB} fill={bFill} />
              <span className="num">{activeRgb.b}</span>
            </div>
          </div>

          <div className="slider-group">
            <h4>
              HSL{" "}
              <span className="group-vals">
                {_hsl.h}°, {_hsl.s}%, {_hsl.l}%
              </span>
            </h4>
            <div className="slider-row">
              <span className="lbl">H</span>
              <Slider
                value={_hsl.h}
                min={0}
                max={360}
                onChange={setH}
                fill={hFill}
              />
              <span className="num">{_hsl.h}°</span>
            </div>
            <div className="slider-row">
              <span className="lbl">S</span>
              <Slider
                value={_hsl.s}
                min={0}
                max={100}
                onChange={setS}
                fill={sFill}
              />
              <span className="num">{_hsl.s}%</span>
            </div>
            <div className="slider-row">
              <span className="lbl">L</span>
              <Slider
                value={_hsl.l}
                min={0}
                max={100}
                onChange={setL}
                fill={lFill}
              />
              <span className="num">{_hsl.l}%</span>
            </div>
          </div>
        </Panel>

        {/* contrast*/}
        <Panel title="Contrast" chips={["wcag"]}>
          <div
            className="contrast-preview"
            style={{ background: rgbToHex(bgRgb), color: hex }}
          >
            <div className="lg">The quick brown fox</div>
            <div className="md">jumps over the lazy dog</div>
            <div className="sm">0123456789 — abcdefghijklmnopqrstuvwxyz</div>
          </div>

          <div className="contrast-pickers">
            <div
              className={
                "color-pick " + (activeTarget === "fg" ? "is-active" : "")
              }
              onClick={() => setActiveTarget("fg")}
              title="Edit foreground"
            >
              <div className="swatch-mini" style={{ background: hex }} />
              <div className="pk-text">
                <span className="pk-role">Foreground</span>
                <span className="pk-val">{hex}</span>
              </div>
            </div>
            <div
              className={
                "color-pick " + (activeTarget === "bg" ? "is-active" : "")
              }
              onClick={() => setActiveTarget("bg")}
              title="Edit background"
            >
              <div
                className="swatch-mini"
                style={{ background: rgbToHex(bgRgb) }}
              />
              <div className="pk-text">
                <span className="pk-role">Background</span>
                <span className="pk-val">{rgbToHex(bgRgb)}</span>
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 8 }}
          >
            <button className="swap-btn" onClick={swap} title="Swap fg / bg">
              <Shuffle />
            </button>
          </div>

          <div className="ratio-row">
            <div>
              <div className="ratio-num value-mono">
                {ratioStr}
                <span className="x">:1</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  marginTop: 2,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Contrast ratio
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "var(--text-3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Normal text
              </div>
              <div className="badges">
                <ContrastBadge ratio={ratio} threshold={4.5} label="AA" />
                <ContrastBadge ratio={ratio} threshold={7} label="AAA" />
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "var(--text-3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Large text
              </div>
              <div className="badges">
                <ContrastBadge ratio={ratio} threshold={3} label="AA" />
                <ContrastBadge ratio={ratio} threshold={4.5} label="AAA" />
              </div>
            </div>
          </div>

          <button
            className="fix-btn"
            disabled={passes}
            onClick={() => {
              const fixed = fixForegroundContrast(rgb, bgRgb, 4.5);
              if (fixed) setRgb(fixed);
            }}
          >
            <Sparkles />
            {passes
              ? "Passes WCAG AA"
              : "Fix contrast — nudge foreground to AA"}
          </button>
          {!passes && (
            <div className="fix-hint">
              Adjusts only the foreground's lightness; hue stays put.
            </div>
          )}
        </Panel>
      </div>

      {/* pallete */}
      <Panel title="Palette" chips={["shades", "harmonies"]}>
        <PaletteCard
          title="Shades"
          hint="lightest → darkest"
          cols={5}
          swatches={shades.map((s, i) => ({
            rgb: s,
            label: rgbToHex(s) + "  ·  " + (i + 1) * 100,
          }))}
          copyText={paletteToCss("shade", shades)}
          copyLabel="Copy CSS"
        />

        <div className="palette-block-card">
          <div className="palette-head">
            <h5>Harmonies</h5>
          </div>
          <div className="harmony-tabs" role="tablist">
            {["complementary", "analogous", "triadic", "split"].map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={activeHarmony === k}
                className={
                  "harmony-tab " + (activeHarmony === k ? "active" : "")
                }
                onClick={() => setActiveHarmony(k)}
              >
                {HARMONY_DESCRIPTIONS[k].name}
              </button>
            ))}
          </div>
          <PaletteCard
            key={activeHarmony}
            title={harmonyMeta.name}
            description={harmonyMeta.blurb}
            cols={harmonySet.length}
            swatches={harmonySet.map((s) => ({ rgb: s, label: rgbToHex(s) }))}
            copyText={paletteToCss(harmonyMeta.name, harmonySet)}
            copyLabel="Copy CSS"
          />
        </div>

        <div className="css-out">
          <div className="css-out-head">
            <h5>All tokens</h5>
            <button
              className="ghost-btn"
              onClick={() => {
                const text =
                  ":root {\n" +
                  cssVars.map(([k, v]) => `  ${k.trim()}: ${v};`).join("\n") +
                  "\n}";
                navigator.clipboard?.writeText(text);
                toast("Copied!");
              }}
            >
              <Copy /> Copy
            </button>
          </div>
          <pre>
            {":root {\n"}
            {cssVars.map(([k, v], i) => (
              <span key={i}>
                {"  "}
                <span className="tk-prop">{k.trim()}</span>
                {": "}
                <span className="tk-val">{v}</span>;{"\n"}
              </span>
            ))}
            {"}"}
          </pre>
        </div>
      </Panel>
    </div>
  );
}
