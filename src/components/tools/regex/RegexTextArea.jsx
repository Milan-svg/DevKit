import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { buildHighlightSegments } from "../../../lib/regexUtils.js";

const RegexTextArea = forwardRef(function RegexTextArea(
  {
    value,
    onChange,
    matches,
    activeIndex,
    onMatchClick,
    placeholder,
    height = 360,
  },
  ref,
) {
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusMatch(idx) {
      const m = matches[idx];
      if (!m || !textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      textareaRef.current.setSelectionRange(m.start, m.end);
      scrollToMatch(idx);
    },
    focus() {
      textareaRef.current?.focus();
    },
  }));

  const segments = useMemo(
    () => buildHighlightSegments(value, matches),
    [value, matches],
  );

  function scrollToMatch(idx) {
    const overlay = overlayRef.current;
    const textarea = textareaRef.current;
    if (!overlay || !textarea) return;
    const targetEl = overlay.querySelector(`[data-match-idx="${idx}"]`);
    if (!targetEl) return;
    const overlayRect = overlay.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const desiredTop =
      textarea.scrollTop +
      (targetRect.top - overlayRect.top) -
      overlay.clientHeight / 2 +
      targetRect.height / 2;
    textarea.scrollTop = Math.max(0, desiredTop);
    syncScroll();
  }

  function syncScroll() {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  useEffect(() => {
    if (activeIndex == null) return;
    scrollToMatch(activeIndex);
  }, [activeIndex]);

  const handleOverlayClick = (e) => {
    const el = e.target.closest("[data-match-idx]");
    if (!el) return;
    const idx = parseInt(el.dataset.matchIdx, 10);
    if (Number.isFinite(idx)) onMatchClick?.(idx);
  };

  return (
    <div className="regex-textarea-stack" style={{ height }}>
      <pre
        ref={overlayRef}
        className="regex-overlay"
        aria-hidden="true"
        onClick={handleOverlayClick}
      >
        {segments.map((seg, i) =>
          seg.kind === "match" ? (
            <span
              key={i}
              className={
                "regex-match-hit " +
                (activeIndex === seg.index ? "is-active" : "")
              }
              data-match-idx={seg.index}
            >
              {seg.text || "​"}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
        {"\n​"}
      </pre>
      <textarea
        ref={textareaRef}
        className="regex-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        wrap="soft"
      />
    </div>
  );
});

export default RegexTextArea;
