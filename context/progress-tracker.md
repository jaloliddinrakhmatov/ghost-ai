# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Design System & UI Primitives

## Current Goal

- Define the immediate implementation goal here.

## Completed

- `01-design-system`: shadcn/ui initialized with Tailwind v4, lucide-react installed, all 7 UI components added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `lib/utils.ts` with `cn()` created, `globals.css` updated with dark-only theme mapping project design tokens to shadcn variables.
- `02-editor`: `EditorNavbar` (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose) and `ProjectSidebar` (floating overlay, slides in from left, Tabs for My Projects/Shared, New Project button) created in `components/editor/`.
- `06-project-apis`: REST routes `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/[projectId]`, `DELETE /api/projects/[projectId]`. Auth via Clerk `auth()` — 401 for unauthenticated, 403 for non-owner mutations. Default project name `Untitled Project` on create.
- `05-prisma`: `prisma/models/project.prisma` with `Project` and `ProjectCollaborator` models (indexes, cascade delete, unique constraints). `lib/prisma.ts` singleton branching on Accelerate vs direct pg adapter. Migration `20260524064520_init` applied, client generated to `app/generated/prisma/`.
- `04-project-dialogs`: Editor home screen with heading + New Project CTA. `useProjectDialogs` hook managing dialog/form/loading state with mock data. Create (with live slug preview), Rename (prefilled + auto-focus + Enter submit), and Delete (destructive) dialogs. Sidebar updated with per-project rename/delete actions shown only for owned projects, plus mobile backdrop scrim.
- `07-wire-editor-home`: `app/editor/page.tsx` converted to async server component — fetches owned + shared projects via `lib/projects.ts` (`getProjectsForUser`) using Clerk `auth()` + `currentUser()`. `useProjectActions` hook replaces mock `useProjectDialogs` — Create calls `POST /api/projects` with slug+suffix room ID (aligned as project ID), navigates to `/editor/[roomId]`; Rename calls `PATCH` + `router.refresh()`; Delete calls `DELETE`, redirects to `/editor` if active workspace else refreshes. `POST /api/projects` updated to accept optional `id` override. `EditorHomeClient` client component wraps sidebar/dialogs state. Create dialog shows live Room ID preview. `ProjectSidebar` updated to accept `owned`/`shared` props directly.
- `03-auth`: Clerk wired in — `ClerkProvider` with `dark` theme wraps root layout, CSS variable overrides applied via `appearance.variables`. `proxy.ts` at project root (Next.js 16 renamed `middleware.ts`) with `clerkMiddleware` protecting all routes except `/sign-in` and `/sign-up`. Sign-in and sign-up pages use two-panel layout (logo + tagline on left for lg screens, Clerk form on right). `/` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`. `UserButton` added to editor navbar right section. `@clerk/ui` installed for theme import.

## Completed (continued)

- `12-shape-panel`: Floating pill toolbar at bottom-center of canvas with 6 draggable shape buttons (rectangle, diamond, circle, pill, cylinder, hexagon). Drag payload carries shape name and default dimensions. `CanvasWrapper` handles `dragover`/`drop` via ReactFlow props — drops convert screen coords to flow coords via `screenToFlowPosition` and create `canvasNode` nodes with ID format `${shape}-${timestamp}-${counter}`. `CanvasNodeRenderer` (memoized) renders all shapes as bordered rectangles with centered label. `ReactFlowProvider` wraps `CanvasInner` so `useReactFlow` is available. `NodeData.shape` extended with all 6 shape values.
- `13-node-shape`: `CanvasNodeRenderer` updated — rectangle/pill/circle use CSS (`border-radius` via inline style), diamond/hexagon/cylinder render with inline SVG scaled to node width/height. Borders subtle at rest, accent-primary when selected. `ShapePanel` now shows a portal-based ghost drag preview: default drag image suppressed, a `ShapePreview` div/SVG follows the cursor via `onDrag` events, hidden on `dragend`.
- `14-node-editing`: `CanvasNodeRenderer` gains `NodeResizer` (visible when selected, min 80×40, subtle handles matching accent-primary). Double-click opens inline `LabelOverlay` textarea positioned over the label; updates committed on blur or Enter, cancelled on Escape. Text interactions stop pointer/mouse propagation to prevent canvas drag. Label updates dispatched via `node:label-update` custom event; `CanvasInner` in `canvas-wrapper.tsx` listens and calls `setNodes` to flow updates through Liveblocks.
- `15-nodes-color-toolbar`: `NODE_COLORS` (8 bg/text pairs from ui-context) added to `types/canvas.ts`. `NodeData` extended with `textColor`. Floating `NodeColorToolbar` pill renders above selected nodes — 18 px circular swatches, active swatch bordered with its text color, hover glow tight via `box-shadow`. Swatch clicks dispatch `node:color-update`; `CanvasInner` listens and updates both `color` + `textColor` via `setNodes`. SVG shapes (diamond/hexagon/cylinder) now accept `fill` prop so color applies to all shape types.
- `11-base-canvas`: `CanvasWrapper` client component in `components/editor/canvas-wrapper.tsx` — `LiveblocksProvider` (auth via `/api/liveblocks-auth`) + `RoomProvider` (room ID = project ID, initial presence `cursor: null, isThinking: false`) + `ClientSideSuspense` with loading state + `LiveblocksErrorBoundary`. `Canvas` inner component uses `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })` and renders `ReactFlow` with `MiniMap` and dot-pattern `Background`. Shared types in `types/canvas.ts` — `NodeData` (label, color, shape), `CanvasNode`, `CanvasEdge`. `WorkspaceClient` canvas placeholder replaced with `<CanvasWrapper roomId={projectId} />`.
- `10-liveblocks-setup`: `liveblocks.config.ts` defines `Presence` (cursor position + `isThinking`) and `UserMeta` (id, name, avatar, color). `lib/liveblocks.ts` — cached `Liveblocks` node client + `cursorColorForUser` (deterministic palette mapping). `POST /api/liveblocks-auth` — requires Clerk auth, verifies project access via `getProjectWithAccess`, ensures room exists (create-if-needed), returns session token with name/avatar/color. `@liveblocks/node@3.19.3` installed.
- `09-share-dialog`: `ShareDialog` component with owner/collaborator role-based views. `GET/POST /api/projects/[projectId]/collaborators` routes (list + invite), `DELETE /api/projects/[projectId]/collaborators/[email]` (remove). Clerk Backend API enriches emails with display name and avatar; owner shown first with OWNER badge. `WorkspaceClient` updated with `isOwner` prop and share state. Workspace server page derives and passes `isOwner`.
- `08-editor-workspace-shell`: `app/editor/[roomId]/page.tsx` server component with access checks — unauthenticated redirects to `/sign-in`, missing/unauthorized shows `AccessDenied`. `lib/project-access.ts` with `getClerkIdentity()` and `getProjectWithAccess()` (owner or collaborator by primary email). `AccessDenied` component: centered lock icon + message + link back to `/editor`. `EditorNavbar` extended with optional `projectName`, `onShare`, `isAiOpen`, `onAiToggle` props. `ProjectSidebar` extended with `activeProjectId` to highlight current room. `WorkspaceClient` client shell: sidebar toggle, AI sidebar placeholder, canvas placeholder.

- `16-edge-behavior`: Custom `CanvasEdgeRenderer` in `components/editor/canvas-edge.tsx` — `getSmoothStepPath` for right-angle routing, `BaseEdge` + `EdgeLabelRenderer` for inline label at path midpoint. Double-click label area to edit; saves on blur/Enter/Escape via `edge:label-update` custom event; saved labels shown as pill badges; faint "+ label" hint when edge selected with no label. `ConnectionMode.Loose` + all-source handles (top/right/bottom/left) with IDs enable any-to-any connections. Handles styled as small white dots, hidden at rest, fading in on node hover via globals.css. CSS widens edge hit area to 16px without thickening visible stroke; edges dim at rest (opacity 0.6) and brighten on hover/selected. `defaultEdgeOptions` sets `canvasEdge` type + `ArrowClosed` markerEnd. `CanvasInner` listens to `edge:label-update` and updates via `setEdges`. `EdgeData` added to `types/canvas.ts`.
- `17-canvas-ergonomics`: `CanvasControlBar` pill at bottom-left of canvas (above shape panel) with zoom out / fit view / zoom in + divider + undo / redo. Zoom actions call `instance.zoomIn/zoomOut/fitView` with 200–300ms duration. Undo/redo use `useHistory`, `useCanUndo`, `useCanRedo` from `@liveblocks/react`; disabled buttons dimmed. `hooks/useKeyboardShortcuts` listens on `window` for `+`/`=` zoom in, `-` zoom out, `⌘Z` undo, `⌘⇧Z` / `⌘Y` redo; skips editable targets.
- `18-starter-template`: `components/editor/starter-templates.ts` defines `CanvasTemplate` type and three templates (Microservices, CI/CD Pipeline, Event-Driven System) using shared canvas types and `NODE_COLORS` palette. `StarterTemplatesModal` opens as a Dialog with a scrollable 3-column card grid; each card shows an SVG diagram preview (bounds-fitted, edges as lines, nodes as shapes/colors) and an Import button. Import dispatches `canvas:load-template` custom event; `CanvasInner` in `canvas-wrapper.tsx` listens, calls `setNodes`/`setEdges` (replacing all current content), then `fitView`. `EditorNavbar` gains `onTemplates` prop wired to a "Templates" button. `WorkspaceClient` manages `templatesOpen` state and connects everything.

## In Progress

None.

## Next Up

- Next feature unit TBD.


## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Dark-only: no `.dark` class variant needed — all shadcn tokens mapped directly in `:root` to dark values.
- shadcn Tailwind v4 integration uses `@import "shadcn/tailwind.css"` and CSS-first configuration.

## Session Notes

- Next.js 16.2.6, Tailwind v4, React 19. shadcn components live in `components/ui/` — do not modify them directly.
