# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2026-06-20

First minor release since 1.7.x. Consolidates three rounds of
production-hardening: correctness bugs, sanitizer safety, full
internationalization, and a broader public API. All additions are
backward compatible.

### Added

- Public API: `insertHTML`, `clear`, `isEmpty`, `focus`, `blur`,
  `setReadOnly`, `isReadOnly`, `undo`, and `redo`.
- Floating table toolbar for inserting and deleting rows and columns,
  shown when the caret is inside a table.
- Link editing: editing the caret's existing link updates it in place,
  and clearing the URL removes the link (unlink).
- `LocaleDict.status` block for status-bar and transient-message
  localization. Optional, with English fallback.
- CJK-aware word count (each ideograph, kana, or Hangul syllable counts
  as one word).

### Fixed

- Configured `placeholder` now renders (previously a no-op).
- Plain-text paste preserves newlines as `<br>`.
- Images dropped or pasted without an upload hook now surface feedback
  instead of being silently dropped.

### Security

- Removed `allow-same-origin` from the iframe sandbox to prevent
  sandbox escape.
- HTML comments are stripped via DOM traversal instead of a pre-parse
  regex.
- URLs are validated at the command layer for `createLink`,
  `insertImage`, and `insertVideo`.
- Strict, validated inline-style allowlist (`text-align`,
  `text-decoration[-line]`) so alignment survives round-trips while all
  other styles and `url()`/injection are stripped.

### Performance

- Removed O(n^2) output-cleanup pass (single reverse-order pass).
- Removed O(n^2) history pruning (incremental byte accounting).

### Accessibility

- Keyboard focus rings via `:focus-visible` for toolbar and table-tool
  buttons.
- `prefers-reduced-motion` support, scoped to the editor container.

### Internal

- Test suite expanded from 63 to 102 unit tests.

## [1.7.1]

- Baseline release prior to the 1.8.0 hardening work.

[1.8.0]: https://github.com/zidony/inkflow-editor/releases/tag/v1.8.0
[1.7.1]: https://github.com/zidony/inkflow-editor/releases/tag/v1.7.1
