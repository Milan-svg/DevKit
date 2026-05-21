import { useEffect, useRef } from "react";
import { Sparkles } from "../../Icons.jsx";

function positionLabel(start, text) {
  let line = 1,
    col = 1;
  for (let i = 0; i < start && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      col = 1;
    } else col++;
  }
  return { line, col };
}

export default function RegexResults({
  matches,
  text,
  activeIndex,
  onSelect,
  truncated,
  error,
  empty,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    if (activeIndex == null || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-result-idx="${activeIndex}"]`,
    );
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  if (error) {
    return (
      <div className="regex-empty">
        <div className="empty-icon regex-empty-icon error">
          <Sparkles />
        </div>
        <div className="empty-title">Invalid pattern</div>
        <div className="empty-sub">{error}</div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="regex-empty">
        <div className="empty-icon">
          <Sparkles />
        </div>
        <div className="empty-title">Enter a pattern</div>
        <div className="empty-sub">
          Matches and captured groups will appear here as you type.
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="regex-empty">
        <div className="empty-icon">
          <Sparkles />
        </div>
        <div className="empty-title">No matches</div>
        <div className="empty-sub">
          The pattern is valid but nothing in the test text matches.
        </div>
      </div>
    );
  }

  return (
    <div className="regex-results">
      {truncated && (
        <div className="regex-truncated">
          Showing the first {matches.length.toLocaleString()} matches: truncated
          for performance.
        </div>
      )}
      <div className="regex-results-list" ref={listRef}>
        {matches.map((m) => {
          const { line, col } = positionLabel(m.start, text);
          const active = activeIndex === m.index;
          const hasGroups = m.groups && m.groups.length > 0;
          const hasNamed =
            m.namedGroups && Object.keys(m.namedGroups).length > 0;
          return (
            <button
              key={m.index}
              data-result-idx={m.index}
              className={"regex-result " + (active ? "is-active" : "")}
              onClick={() => onSelect?.(m.index)}
            >
              <div className="regex-result-head">
                <span className="regex-result-idx value-mono">
                  #{m.index + 1}
                </span>
                <span className="regex-result-pos value-mono">
                  L{line}:{col}
                </span>
                <span className="regex-result-span value-mono">
                  {m.start}–{m.end}
                </span>
              </div>
              <div className="regex-result-text value-mono">
                {m.text || (
                  <span className="regex-result-empty">empty match</span>
                )}
              </div>
              {(hasGroups || hasNamed) && (
                <div className="regex-result-groups">
                  {hasGroups &&
                    m.groups.map((g, i) => (
                      <span key={i} className="regex-group">
                        <span className="regex-group-key value-mono">
                          ${i + 1}
                        </span>
                        <span className="regex-group-val value-mono">
                          {g == null ? "∅" : g}
                        </span>
                      </span>
                    ))}
                  {hasNamed &&
                    Object.entries(m.namedGroups).map(([k, v]) => (
                      <span key={"n-" + k} className="regex-group named">
                        <span className="regex-group-key value-mono">{k}</span>
                        <span className="regex-group-val value-mono">
                          {v == null ? "∅" : v}
                        </span>
                      </span>
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
