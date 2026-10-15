# RuneQi MD — Technical Documentation

RuneQi MD is a browser-based Markdown editor built with React, TypeScript and Vite. It combines a live-updating editor and preview, a persistent file explorer, and a settings system, all running fully client-side.

Live at: [runeqimd.dev](https://runeqimd.dev)

> This document is meant to grow with the project. If you add a feature, extend a section here rather than leaving it undocumented - see [Contributing to this document](#contributing-to-this-document) at the bottom.

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Core features](#core-features)
  - [Editor & toolbar](#editor--toolbar)
  - [Live preview](#live-preview)
  - [Split workspace & scroll sync](#split-workspace--scroll-sync)
  - [File explorer](#file-explorer)
  - [Settings](#settings)
  - [Theming](#theming)
- [Data persistence](#data-persistence)
- [Platform support](#platform-support)
- [Deployment](#deployment)
- [Contributing to this document](#contributing-to-this-document)

## Overview

RuneQi MD is a desktop-first, single-page Markdown editor. There is no backend — everything (file storage, settings, editor state) lives in the browser via IndexedDB, so a user's documents persist across sessions on the same device without an account or server.

The app is organized around two layouts (`DesktopLayout`, `MobileLayout`), switched at runtime by viewport/user-agent detection. Mobile currently shows a "desktop only" notice rather than a functional editor.

## Tech stack

| Layer | Choice |
|---|---|
| UI framework | React + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| Markdown rendering | `react-markdown` + `remark-gfm`, `remark-breaks`, `rehype-raw` |
| Syntax highlighting | `react-syntax-highlighter` (Prism themes) |
| File tree UI | `react-arborist` |
| Local persistence | Dexie (IndexedDB wrapper) |
| Resizable panels | `react-resizable-panels` |
| Icons | `react-icons` |

## Core features

### Editor & toolbar

The editor is powered by Monaco, configured for Markdown syntax highlighting. The toolbar exposes formatting actions as buttons and dropdowns:

- Headings (H1–H6)
- Bold, italic, strikethrough
- Inline code, code blocks (with language selector)
- Blockquotes
- Links and images (via input dropdowns)
- Unordered, ordered, and task lists — with "smart continuation": pressing Enter inside a list automatically continues it (adding the next bullet, incrementing numbering, or repeating a checkbox), and pressing Enter on an empty list item exits the list instead of adding another one
- Tables (via a rows × columns selector)
- Emoji picker
- Undo / redo

This actions have a keyboard shortcut.

> These actions have a keyboard shortcut. Shortcuts are a work in progress — a couple of actions currently share the same binding, and this is expected to be cleaned up as the toolbar stabilizes.

### Live preview

Markdown is rendered via `react-markdown` with a custom component map per HTML element (headings, tables, code blocks, task-list checkboxes, etc.), themed for both light and dark mode. Code blocks get syntax highlighting through Prism.

### Split workspace & scroll sync

The workspace can show the editor only, the preview only, or both side by side (resizable via a drag handle). When both panels are visible, scroll position can optionally sync between them.

### File explorer

A collapsible panel (opened from the toolbar) showing a file/folder tree:

- Folders exist at the root level only — no nested folders by design, keeping the tree flat and simple.
- Files can be created inside a selected folder, or at the root.
- Creating a file or folder opens an inline text input in the tree to name it.
- Folders expand/collapse by clicking anywhere on their row.
- Clicking a file opens it in the editor; each open file keeps its own independent undo/redo history.
- The currently open file is shown in bold in the tree; the most recently clicked node is highlighted.

All file/folder data is persisted locally (see [Data persistence](#data-persistence)).

### Settings

Available from the sidebar menu, settings are grouped by area — workspace layout, editor appearance, and preview/Markdown parsing behavior — and only show the groups relevant to the current view mode. All settings can be reset to defaults at any time. The specific options are self-explanatory in the UI and are expected to grow.

### Theming

A light/dark toggle switches both the Monaco editor theme and the preview's color scheme in sync.

## Data persistence

RuneQi MD stores everything locally in the browser via **IndexedDB**, wrapped with **Dexie** for a simpler query API and React integration (`dexie-react-hooks`). There is currently no cloud sync or account system — data lives on the device/browser it was created in.

This means: clearing browser storage, using a different browser, or going incognito will not show previously created files.

## Platform support

RuneQi currently targets **desktop browsers only**. On small viewports or mobile user agents, the app shows a static "desktop only" screen instead of the editor. This is a deliberate scope decision, not a technical limitation of the underlying architecture — the file system and editor logic don't inherently depend on desktop-only APIs.

## Deployment

- Hosted at [runeqimd.dev](https://runeqimd.dev) via Vercel
- DNS, SSL, and basic SEO (sitemap, Google Search Console) configured

## Contributing to this document

This file is meant to stay current as the project evolves. When you ship a feature, fix, or architectural change worth knowing about at a glance:

- Add or update the relevant section above rather than creating a separate doc, unless the topic is large enough to deserve its own file (in which case, link it from here).
- Keep the tone at "what does this do and why would I use/extend it," not implementation detail — that belongs in code comments or inline docs, not here.
- If you're unsure whether something belongs here, err on the side of adding a short note — it's easier to trim later than to reconstruct context after the fact.
