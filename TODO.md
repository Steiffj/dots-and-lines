
## App Layout and Design
- __DONE__ Generate lots of test data.
- Manage dragging state in graph attributes.
- Monaco editor integration.
- Read/edit data from filesystem.
    - Edit graph datasets with live reload.
    - Save screenshot of the graph visualization with the serialized graph data.
- Resizable split window
- Render HTML overlay/popup elements on top of stage - auto constrain to viewport.
- Icon registry (Python API with server-side image/SVG resizing via query params)

## Key Bindings
Keyboard navigation.
- Zoom/pan with arrow keys, WASD, or HJKL.
- Bottom status bar indicates current mode.
- Tab selection when stage is focused based on mouse position.
    - Navigate via tab/shift-tab
    - Esc to leave stage focus

## Visualization
- __DONE-ish, needs perf testing__ Efficient node/edge reducers - object pooling with garbage collection management through graphology event emitters.
    - support multiple callbacks with priority and graph/renderer variable access.
- Make node hover renderers responsive to light/dark mode.
- Render self loops.
- Utilize WebGL layer for grouping?
- Layout options
    - Fix subgraphs in place
    - Only allow specified nodes to move
- Write ForceAtlas2 layout preprocessor algorithm for nicer animation and fast convergence.
- Color themes plus some generation
    - Colorblind options.
- Minimap?
- Create new nodes and edges interactively.
    - Use a lil baby invisible node to support connecting new edge to target.
- Render incident edge details AND hide auto-displayed edge labels when hovering or selecting a node.
- Grey out/pseudo-hide non-adjacent nodes when selecting a node.
- Manage selection state in graph attributes

### Tailwind to Canvas/WebGL
- Border radius
- Highlight color
- Box shadow color
- Text padding
- Stroke (outline) color
- __DONE__ Text color
- __DONE__ Background color

### Rendering Niceties
- Ellipses on highlights labels that exceed a certain (pixel) width
- Show full label if mouse hovering or otherwise selected.
- Optional preview text transforms for abbreviated labels without ellipses

## Performance
- 14kB rule!
- Defer loading scripts based on route (design an approach w/ vanilla JS)
- PWA service worker file caching
- Cache node/edge canvas shapes for hover/highlight/active/whatever. Probably will need LRU eviction.
    - Not sure how edge labels are handled in Sigma, but assuming canvas since they're rendering text.
- Event performance optimizations (turn off node/edge events while panning?)
    - Sigma has other relevant settings built in too, like hiding edges on pan
