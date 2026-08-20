import { Poster } from './poster';

export function Layers() {
  return <>
    <picture data-layer="wall" data-depth="0.09" className="stage-layer stage-wall" aria-hidden="true">
      <source srcSet="/stage/wall-khanna-1838.avif" type="image/avif" />
      <img data-lcp-wall data-lcp-stage-image src="/stage/wall-khanna-1838.webp" alt="" fetchPriority="high" />
    </picture>
    <Poster />
  </>;
}
