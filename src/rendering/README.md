# Rendering Structure
Decouple rendering concerns for:
- Text and path creation should be dedicated, single-purpose functions.
- Text/paths should be cached as path data or image bitmaps.
- Translations and transformations should also be dedicated functions.
- Final renderer utilizes cached resources and applies translations.

## Rendering Feature Dependencies/Interactions
Need a way to declare interactions between multiple features without the individual features being aware of each other.
- Return a symbol identifying each feature in the feature implementations.
- Require identification via a symbol on reducer/renderer registration.
- Implement a self-contained set of dependencies that relate features to each other.
    - Apply renderers/reducers in a specified order.
    - One feature being active temporarily disabling another.
- Disable and/or reorder individual renderers/reducers within the registries.
- Standardize feature state representation?
    - Flag to indicate whether a feature is active.
    - Lists of nodes/edges affected by the 
    - Node/edge lists can be used by renderers/reducers and for passing to Sigma's lifecycle scheduling.

## Renderer Caching Optimizations
- Move offscreen canvas into web workers and transfer cached resources back to main thread.
- Caching system needs access to Sigma to do a targeted refresh after the cached resource is available.
    - There will be edge cases of transient performance degradation if rendering isn't deferred.
      (e.g., the first frame after supernode drag start will block the main thread if all text labels are drawn directly to Sigma's canvas at once).
- Rendering caches should be able to temporarily burst resize to account for specific features/user interactions.
    - Exceeding a renderer cache's capacity may result in labels flashing in and out of view.
