# Burabay — A different kind of wild

A complete, static experiential website for Burabay National Park, Kazakhstan.

## Open the experience

Open `index.html` in a modern browser. An internet connection loads the Google Fonts, pinned CDN libraries and Unsplash photography. For development or hosting, serve this folder as a static website. There is no build step.

Keep `burabayvideo.mp4` beside `index.html`. The original Full HD film remains the hero background. `assets/hero-poster.jpg` is a still extracted from that film, used while video loads and as a photographic fallback.

## Files

```text
projectfair/
├── index.html
├── style.css
├── app.js
├── burabayvideo.mp4
├── README.md
└── assets/
    ├── favicon.svg
    ├── grain.svg
    ├── hero-poster.jpg
    └── sources.json
```

## Experience

- Fullscreen muted video with an explicit play/pause control, staggered title reveal and scroll-linked zoom/mask expansion.
- Responsive navigation, magnetic controls, a lagging velocity-sensitive cursor and palette-aware glass navigation.
- Three landmark stories in a pinned horizontal desktop deck, with a natural vertical layout on mobile and in reduced-motion mode.
- Keyboard chapter navigation, native accessible story dialogs and source/map links.
- Four seasonal field guides, keyboard-operable season tabs and expandable wellness, equestrian, glamping and cultural notes.
- Cards with restrained 3D tilt and a short desktop pin on tall screens.
- A functional 2–4 day expedition planner with seasonal recommendations, three travel styles, plain-text itinerary export and a route link.
- A live Kazakhstan clock, optional synthesized wind/water audio, image credits and smooth navigation back to the hero.

## Typography and dependencies

Display: Italiana. Editorial text: Cormorant Garamond. Interface: Syne. Geographic metadata: Space Mono.

Pinned CDN dependencies: GSAP/ScrollTrigger 3.13.0, SplitType 0.3.4, Lenis 1.3.8 and Lucide 0.468.0. The source stays readable and the planner remains operational if an animation CDN is unavailable.

## Accessibility and performance

The site supports reduced motion, keyboard navigation, visible focus, native dialog focus containment, Escape dismissal, tab arrow keys and mobile touch controls. Decorative character splits are hidden from assistive technology and retain an accessible heading label. Video pauses offscreen and when the browser tab is hidden. Audio starts only after a visitor enables it.

Motion uses transforms and opacity where possible, one shared GSAP/Lenis ticker and bounded scroll effects. Photos load lazily, and the film requests metadata before playback. High-resolution photographic CDN URLs use `auto=format&fit=crop&q=85&w=2400`. The poster provides a local fallback.

## Content and assets

Photo credits and destination sources are linked in the website's credits dialog and recorded in `assets/sources.json`. The legend cards are regional landscape studies; their images are not identified as documentary portraits of the named individual rocks. The original video is user-supplied.

The itinerary is a practical suggested route. Visitors can use the official destination guide and map links to arrange their travel and confirm current seasonal conditions.
