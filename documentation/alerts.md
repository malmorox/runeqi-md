# Alerts

Short, non-blocking notifications (toasts) that tell the user how an action went: a file imported, something rejected, a change that couldn't be saved, an item moved to Trash... They show up in the bottom-right corner and go away on their own.

> This document is meant to grow with the feature. When you add an alert, change how they behave or find a limitation, update the matching section below.

## Contents

- [At a glance](#at-a-glance)
- [Variants](#variants)
- [Behavior](#behavior)
- [Using alerts in code](#using-alerts-in-code)
- [Writing good alerts](#writing-good-alerts)
- [Alert, modal or inline message?](#alert-modal-or-inline-message)
- [Current alerts](#current-alerts)
- [Architecture](#architecture)
- [Accessibility](#accessibility)
- [Design decisions](#design-decisions)
- [Known limitations and ideas](#known-limitations-and-ideas)
- [Troubleshooting](#troubleshooting)

## At a glance

```tsx
const alerts = useAlerts();

alerts.success({ title: 'File imported', message: '"notes" is now open in the editor.' });
```

- Four variants: `success`, `error`, `warning`, `info`.
- Optional `message` (multi-line), `action` button and custom `duration`.
- They follow the editor's light/dark theme and keep the app's sky accent.
- The countdown stops while the pointer is over an alert or it has the keyboard focus.

## Variants

| Variant | Use it for | Duration | Color | Icon | Screen readers |
|---|---|---|---|---|---|
| `success` | An action finished as expected and the result isn't obvious on screen | 4 s | Emerald | Check circle | Polite (`role="status"`) |
| `info` | Important notices that aren't a problem (e.g. moved to Trash, with Undo) | 5 s | Sky (brand) | Info circle | Polite (`role="status"`) |
| `warning` | It partly worked (e.g. 2 of 3 files imported) | 7 s | Amber | Triangle | Polite (`role="status"`) |
| `error` | It didn't work: rejected input or a storage failure | 8 s | Red | X circle | Interrupts (`role="alert"`) |

Alerts with an action get at least **6 s**, so there's time to use the button.

The status color only appears on the icon, the left edge and the timer bar. The frame, the action buttons and the focus rings keep the sky accent. The status is never told by color alone: the icon, the title and a hidden prefix for screen readers ("Error:", "Success:"...) carry it too.

## Behavior

- **Position:** stacked in the bottom-right corner, the newest one at the bottom, above everything else (including modals). The space around them lets clicks through.
- **Auto-dismiss:** each alert goes away after its duration. A thin bar at the bottom shows the time left.
- **Pause:** the countdown (and the bar) stops while the pointer is over the alert or any of its buttons has the keyboard focus, and resumes where it left off.
- **Dismiss:** with the close button (×), with `Esc` while the alert has the focus, or by using its action (which also closes it).
- **Limit:** at most **4** alerts at once. A fifth one makes the oldest go away right away.
- **No duplicates:** if an identical alert (same variant, title and message) is already on screen, the new one takes its place and restarts the countdown instead of piling up. This matters for errors that can repeat, like saving failing on every keystroke.
- **Theme:** dark (`#252526` surface) or light (white surface), following the editor's theme toggle.
- **Animation:** they come in from below and leave to the right (200 ms in, 150 ms out). When the system asks for reduced motion they only fade in and out, without moving, and the timer bar is hidden.

## Using alerts in code

The `useAlerts` hook works in any component or hook below `AlertsProvider` (which wraps the whole app in `main.tsx`):

```tsx
import { useAlerts } from '@hooks/useAlerts';

const alerts = useAlerts();

alerts.success({ title: 'File exported', message: 'Saved as "notes.md".' });
alerts.warning({ title: '2 of 3 files imported', message: listRejections(errors) });
alerts.error({ title: "Your changes couldn't be saved", message: storageErrorMessage(error) });
alerts.info({
    title: 'Moved to Trash',
    message: '"notes" stays in Trash until it\'s emptied.',
    action: { label: 'Undo', onClick: () => restore() },
});
```

### Options

| Option | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | One short line saying what happened. |
| `message` | `string` | No | Details or next step. `\n` starts a new line (used for lists). |
| `action` | `{ label: string; onClick: () => void }` | No | A single follow-up button, e.g. "Undo". Clicking it also closes the alert. |
| `duration` | `number` (ms) | No | Overrides the variant's default duration. |

Every method returns the alert's `id`, which can be passed to `alerts.dismiss(id)` to close it early.

The object returned by `useAlerts()` is stable (it never changes between renders), so it's safe in `useEffect`/`useMemo` dependency lists and inside debounced callbacks.

### Helpers

From [`src/utils/alertMessages.ts`](../src/utils/alertMessages.ts):

- **`listRejections(errors)`** — one line per rejected file, summing up the rest past 3 ("…and 2 more."), so the alert stays short.
- **`storageErrorMessage(error)`** — turns an unexpected IndexedDB/Dexie failure into a message for the user (a specific one when the browser is out of space) and logs the original error to the console.

Typical pattern for anything that writes to storage:

```tsx
try {
    await renameFileSystemEntry(id, name);
} catch (error) {
    alerts.error({ title: "The file couldn't be renamed", message: storageErrorMessage(error) });
}
```

## Writing good alerts

- **Title:** what happened, in a few words. "File imported", "The image couldn't be added". Use the item's name when it helps (`"notes" couldn't be deleted`).
- **Message:** why, or what to do next. Skip it if the title says everything.
- **Counts:** match singular and plural ("File imported" / "3 files imported").
- **Partial results:** one `warning` saying how many made it ("2 of 3 files imported") and listing why the rest didn't, instead of a success plus an error.
- **Language:** the UI is in English; keep the same tone as the rest of the app.
- **Don't announce the obvious:** if the result already shows on screen (an image pasted into the editor), skip the success alert and only report problems.

## Alert, modal or inline message?

| Situation | Use |
|---|---|
| Feedback after an action, nothing to decide | **Alert** |
| A destructive action that needs a decision first (delete permanently, empty Trash) | **Modal** — `ConfirmModal` |
| An error tied to a specific field the user is filling in | **Inline message** next to the field (e.g. the image dropdown in the toolbar) |

## Current alerts

Every place that raises an alert today. Keep this list up to date when adding or removing one.

### Import / Export — [`ImportExportPanel.tsx`](../src/components/ui/ImportExportPanel.tsx)

| Variant | Title | When |
|---|---|---|
| success | `File imported` / `N files imported` | All the Markdown files were imported. The message names the file now open. |
| warning | `X of N files imported` | Only some were imported. Lists the rejected ones and why. |
| error | `The file couldn't be imported` / `The files couldn't be imported` | None were imported: not `.md`/`.markdown`, or larger than 5 MB. |
| error | `Import failed` | Storage failure while importing. |
| success | `File exported` | Chrome, Edge: the file was written after accepting the system's "Save as" dialog. Shows the name chosen there. Closing the dialog shows nothing. |
| info | `Download started` | Firefox, Safari (or wherever the dialog isn't available): the file was handed to the browser as a download. The app can't know if it ends up saved, so it doesn't say it was. |
| error | `The file couldn't be exported` | Writing the file failed after choosing where to save it (e.g. a read-only folder or a file open in another program). |

### Images — [`useImageImport.ts`](../src/hooks/files/useImageImport.ts)

| Variant | Title | When |
|---|---|---|
| success | `Image added` / `N images added` | Only for uploads or drops in the **file explorer** (`notifySuccess: true`). Not for pastes or drops in the editor. |
| warning | `X of N images added` | Only some were added. Lists why. |
| error | `The image couldn't be added` / `The images couldn't be added` | Unsupported format (only PNG, JPG, GIF, WebP, SVG) or larger than 10 MB. |
| error | `The images couldn't be saved` | Storage failure. |

The **Upload image** button in the toolbar's image dropdown keeps its own inline error instead.

### File explorer — [`FileExplorer.tsx`](../src/components/FileExplorer.tsx)

| Variant | Title | When |
|---|---|---|
| info + **Undo** | `Moved to Trash` | An item was moved to Trash. Undo puts it back in its folder (or the root if the folder is gone) and reopens it if it was the open file. |
| error | `"x" couldn't be restored` | Undo failed. |
| success | `Trash emptied` | Trash was emptied. Says how many items were deleted. |
| success | `Deleted permanently` | An item inside Trash was deleted for good. |
| error | `"x" couldn't be moved to Trash` | Storage failure. |
| error | `Trash couldn't be emptied` / `"x" couldn't be deleted` | Storage failure. |
| error | `The file couldn't be created` / `The folder couldn't be created` | Storage failure. |
| error | `It couldn't be renamed` | Storage failure while renaming in the tree. |

### Editor and app start

| Variant | Title | When | Where |
|---|---|---|---|
| error | `Your changes couldn't be saved` | Autosave failed. Repeats replace each other instead of stacking. | [`useFileContent.ts`](../src/hooks/files/useFileContent.ts) |
| error | `The file couldn't be renamed` | Renaming from the file name in the toolbar failed. | [`ActiveFileName.tsx`](../src/components/ui/ActiveFileName.tsx) |
| error | `The Images and Trash folders couldn't be created` | The system folders couldn't be created on start. | [`useEnsureFileSystem.ts`](../src/hooks/files/useEnsureFileSystem.ts) |
| error | `A new file couldn't be created` | The file created when none are left couldn't be saved. | [`useEnsureFileSystem.ts`](../src/hooks/files/useEnsureFileSystem.ts) |

### Settings — [`SidebarContent.tsx`](../src/components/ui/SidebarContent.tsx)

| Variant | Title | When |
|---|---|---|
| success | `Settings reset` | "Reset to defaults" was clicked. |

## Architecture

```
main.tsx
└── AlertsProvider                 state + API (contexts/AlertsContext.tsx)
    └── ... App
        └── DesktopLayout
            ├── (any component)    useAlerts() → alerts.success(...)
            └── Alerts             renders the stack (components/Alerts.tsx)
                └── AlertToast     one alert: timer, pause, buttons (components/ui/AlertToast.tsx)
```

| File | Role |
|---|---|
| [`src/types/alert.ts`](../src/types/alert.ts) | `AlertVariant`, `AlertOptions`, `AlertAction`, `AlertItem`. |
| [`src/constants/alerts.ts`](../src/constants/alerts.ts) | Durations, limit of visible alerts, exit animation length, rejections listed. |
| [`src/contexts/AlertsContext.tsx`](../src/contexts/AlertsContext.tsx) | `AlertsProvider`: the list of alerts, adding (with de-duplication and the limit) and dismissing (exit animation, then removal). |
| [`src/hooks/useAlerts.ts`](../src/hooks/useAlerts.ts) | `useAlerts()` to raise alerts, `useAlertList()` to read the visible ones. |
| [`src/components/Alerts.tsx`](../src/components/Alerts.tsx) | The fixed stack in the corner, rendered once in `DesktopLayout`. |
| [`src/components/ui/AlertToast.tsx`](../src/components/ui/AlertToast.tsx) | A single alert: variant styles, timer with pause, close and action buttons, timer bar. |
| [`src/utils/alertMessages.ts`](../src/utils/alertMessages.ts) | `listRejections` and `storageErrorMessage`. |
| [`src/index.css`](../src/index.css) | Keyframes and `animate-alert-*` utilities. |

**Two contexts.** `AlertsContext` holds the API (stable) and `AlertListContext` holds the list (changes with every alert). Components that only raise alerts — the editor, the explorer — read the first one, so they don't re-render each time an alert appears or goes away.

**Lifecycle of an alert:**

1. `alerts.error({...})` builds an `AlertItem` with a new id and the variant's default duration.
2. If an identical one is on screen, it's replaced in place (new id, so the timer restarts). Otherwise it's added at the end, and the oldest is dropped if there are more than 4.
3. `AlertToast` starts a timer with the remaining time; hovering or focusing it clears the timer and keeps what's left.
4. When the time runs out (or it's closed), `dismiss(id)` marks it as leaving, which plays the exit animation, and removes it 150 ms later.

### Adding a variant

1. Add it to `AlertVariant` in `src/types/alert.ts`.
2. TypeScript then points at what's missing: its duration in `ALERT_DURATIONS` and its icon/colors in `VARIANTS` (`AlertToast.tsx`).
3. Add its method to `AlertsContextType` and the `api` object in `AlertsContext.tsx`.
4. Document it in [Variants](#variants).

## Accessibility

- Errors use `role="alert"` (read right away); the rest use `role="status"` (read when the screen reader is idle). The stack is a `<section aria-label="Notifications">` with a list inside.
- A hidden prefix ("Error: ", "Warning: "...) gives the status in words, not only by color and icon.
- The close button has an accessible name ("Dismiss notification"); icons are hidden from screen readers.
- Alerts never take the focus away from the editor. With the keyboard they can be reached with `Tab`, and `Esc` closes the focused one.
- The countdown stops while an alert has the focus or the pointer, so there's time to read it (WCAG 2.2.1, timing adjustable).
- Reduced motion is respected: fade only, no movement, no timer bar.
- Text contrast is at least 4.5:1 in both themes; action buttons use `sky-400` (dark) and `sky-700` (light).

## Design decisions

- **Own system instead of a library** (e.g. Sonner, react-hot-toast). It's small, has no extra dependency, and matches the app's look exactly. Everything goes through `useAlerts()`, so switching to a library later only means changing that hook and the provider, not the places that raise alerts. Worth reconsidering if we need loading/promise alerts or raising alerts outside React.
- **String union instead of `enum`** for `AlertVariant`. The project has `erasableSyntaxOnly` on, which doesn't allow `enum`. A union gives the same type safety and autocompletion, and `Record<AlertVariant, ...>` makes TypeScript require every variant's settings.
- **Semantic colors for status, sky for the brand.** An error has to look like an error at a glance, so red/amber/emerald stay on the icon and edge, while sky is used for info alerts, actions and focus.
- **Bottom-right corner**, like the editor's own notifications in VS Code: it keeps the toolbar and the text being written clear.

## Known limitations and ideas

- The countdown keeps running while the browser tab is in the background, so an alert can expire before the user comes back.
- No loading/progress alerts (e.g. "Importing…" that turns into success or error).
- Alerts can only be raised from components and hooks (`useAlerts`), not from plain functions.
- In Firefox and Safari exporting is a plain download, so the app can't know whether the user saved or cancelled it: it says "Download started" instead of "File exported".
- An alert dropped because of the limit of 4 disappears without the exit animation.
- Items in Trash can only be restored through the alert's Undo, which lasts a few seconds; there's no Restore button in the explorer yet.
- Roles and labels were checked in the browser, but not with real screen readers (NVDA, VoiceOver).
- Texts are hard-coded in English where each alert is raised; moving them to one place would help with translations.

## Troubleshooting

**Alerts don't slide in or out, they only fade.** The system is asking for reduced motion. On Windows that's *Settings → Accessibility → Visual effects → Animation effects* turned off; on macOS, *Reduce motion*. This is intended.

**An alert disappears too fast to read.** Hover it or focus it to stop the countdown, or pass a longer `duration`.

**`useAlerts must be used inside <AlertsProvider>`.** The component is rendered outside the providers in `main.tsx`.
