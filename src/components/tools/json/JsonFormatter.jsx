import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  parseJson,
  formatJson,
  minifyJson,
  jsonStats,
  SAMPLE_JSON,
} from "../../../lib/jsonUtils.js";
import JsonEditor from "./JsonEditor.jsx";
import JsonTreeView from "./JsonTreeView.jsx";
import JsonDiff from "./JsonDiff.jsx";
import { Copy, Sparkles, Braces } from "../../Icons.jsx";

function ModeTabs({ mode, onMode }) {
  const tabs = [
    { id: "format", label: "Format" },
    { id: "diff", label: "Diff" },
  ];
  return (
    <div className="json-mode-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={mode === t.id}
          className={"json-mode-tab " + (mode === t.id ? "active" : "")}
          onClick={() => onMode(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ViewToggle({ view, onView, disabled }) {
  return (
    <div className="json-view-toggle" role="tablist" aria-disabled={disabled}>
      <button
        role="tab"
        aria-selected={view === "code"}
        className={"json-view-tab " + (view === "code" ? "active" : "")}
        onClick={() => onView("code")}
        disabled={disabled}
      >
        Code
      </button>
      <button
        role="tab"
        aria-selected={view === "tree"}
        className={"json-view-tab " + (view === "tree" ? "active" : "")}
        onClick={() => onView("tree")}
        disabled={disabled}
      >
        Tree
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <span className="json-stat">
      <span className="json-stat-val value-mono">{value}</span>
      <span className="json-stat-lbl">{label}</span>
    </span>
  );
}

function FormatMode() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [view, setView] = useState("code");
  const [indent, setIndent] = useState(2);

  const parsed = useMemo(() => parseJson(input), [input]);
  const formatted = useMemo(
    () => formatJson(input, { indent }),
    [input, indent],
  );
  const stats = useMemo(
    () => (parsed.error || parsed.empty ? null : jsonStats(parsed.value)),
    [parsed],
  );

  const byteSize = useMemo(() => new Blob([input]).size, [input]);
  const minSize = useMemo(() => {
    if (parsed.error || parsed.empty) return null;
    return new Blob([JSON.stringify(parsed.value)]).size;
  }, [parsed]);

  const onFormat = () => {
    if (parsed.error) {
      toast.error(`Line ${parsed.error.line || "?"} · ${parsed.error.message}`);
      return;
    }
    if (parsed.empty) return;
    setInput(formatted.text);
    toast("Formatted");
  };

  const onMinify = () => {
    if (parsed.error) {
      toast.error(`Line ${parsed.error.line || "?"} · ${parsed.error.message}`);
      return;
    }
    if (parsed.empty) return;
    setInput(JSON.stringify(parsed.value));
    toast("Minified");
  };

  const onCopy = (text, label = "Copied!") => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    toast(label);
  };

  const status = parsed.empty
    ? { kind: "empty", label: "Awaiting input" }
    : parsed.error
      ? { kind: "error", label: "Invalid JSON" }
      : { kind: "ok", label: "Valid JSON" };

  return (
    <div className="json-format-grid">
      <div className="json-panel">
        <div className="json-panel-head">
          <div className="json-panel-title">
            <span className={"status-dot " + status.kind} />
            <span>Input</span>
            <span className={"status-label " + status.kind}>
              {status.label}
            </span>
          </div>
          <div className="json-toolbar">
            <button
              className="ghost-btn"
              onClick={() => setInput(SAMPLE_JSON)}
              title="Load sample JSON"
            >
              <Sparkles /> Sample
            </button>
            <button
              className="ghost-btn"
              onClick={() => setInput("")}
              disabled={!input}
            >
              Clear
            </button>
            <button
              className="ghost-btn primary"
              onClick={onFormat}
              disabled={parsed.empty || !!parsed.error}
              title="Pretty-print with current indent"
            >
              <Braces /> Format
            </button>
            <button
              className="ghost-btn"
              onClick={onMinify}
              disabled={parsed.empty || !!parsed.error}
              title="Strip whitespace"
            >
              Minify
            </button>
          </div>
        </div>
        <div data-paste-target="primary">
          <JsonEditor
            value={input}
            onChange={setInput}
            placeholder="Paste or type JSON"
            height="520px"
          />
        </div>
        <div className="json-panel-foot">
          <div className="json-stats">
            <Stat label="bytes" value={byteSize.toLocaleString()} />
            {minSize != null && (
              <Stat label="minified" value={minSize.toLocaleString()} />
            )}
            {stats && (
              <>
                <Stat label="depth" value={stats.maxDepth} />
                <Stat label="keys" value={stats.objects} />
                <Stat label="items" value={stats.arrays} />
              </>
            )}
          </div>
          <div className="json-indent">
            <span className="json-indent-lbl">Indent</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                className={"mini-tab " + (indent === n ? "active" : "")}
                onClick={() => setIndent(n)}
              >
                {n}
              </button>
            ))}
            <button
              className={"mini-tab " + (indent === 0 ? "active" : "")}
              onClick={() => setIndent(0)}
              title="Tabs"
            >
              tab
            </button>
          </div>
        </div>
        {parsed.error && (
          <div className="json-error">
            <span className="json-error-dot" />
            <div className="json-error-text">
              <span className="json-error-loc">
                Line {parsed.error.line || "?"}
                {parsed.error.col ? `, column ${parsed.error.col}` : ""}
              </span>
              <span className="json-error-msg">{parsed.error.message}</span>
            </div>
          </div>
        )}
      </div>

      <div className="json-panel">
        <div className="json-panel-head">
          <div className="json-panel-title">
            <span className="status-dot ok" />
            <span>Output</span>
          </div>
          <div className="json-toolbar">
            <ViewToggle
              view={view}
              onView={setView}
              disabled={parsed.empty || !!parsed.error}
            />
            <button
              className="ghost-btn"
              onClick={() => onCopy(formatted.text)}
              disabled={parsed.empty || !!parsed.error}
              title="Copy formatted JSON"
            >
              <Copy /> Copy
            </button>
          </div>
        </div>
        <div className="json-output">
          <AnimatePresence mode="wait" initial={false}>
            {parsed.empty || parsed.error ? (
              <motion.div
                key="empty"
                className="json-output-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="empty-icon">
                  <Braces />
                </div>
                <div className="empty-title">
                  {parsed.error
                    ? "Fix the input to see formatted output"
                    : "Output appears here"}
                </div>
                <div className="empty-sub">
                  {parsed.error
                    ? "Error details are listed below the input editor."
                    : "As you type valid JSON, the formatted view updates in real time."}
                </div>
              </motion.div>
            ) : view === "tree" ? (
              <motion.div
                key="tree"
                className="json-output-tree"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <JsonTreeView value={parsed.value} />
              </motion.div>
            ) : (
              <motion.div
                key="code"
                className="json-output-code"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <JsonEditor
                  value={formatted.text}
                  onChange={() => {}}
                  readOnly
                  height="520px"
                  placeholder=""
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function JsonFormatter() {
  const [mode, setMode] = useState("format");

  return (
    <div className="json-tool">
      <div className="json-tool-bar">
        <ModeTabs mode={mode} onMode={setMode} />
        <div className="json-tool-hint">
          Runs locally. nothing leaves your browser.
        </div>
      </div>
      <div className="json-mode-stage">
        <div
          className="json-mode-pane"
          style={{ display: mode === "format" ? "block" : "none" }}
        >
          <FormatMode />
        </div>
        <div
          className="json-mode-pane"
          style={{ display: mode === "diff" ? "block" : "none" }}
        >
          <JsonDiff />
        </div>
      </div>
    </div>
  );
}
