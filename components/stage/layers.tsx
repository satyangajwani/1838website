import { Poster } from './poster';

export function Layers() {
  return <>
    <div data-layer="wall" data-depth="0.09" className="stage-layer stage-wall" aria-hidden="true">
      <div className="stage-wall-ceremony">
        <div className="stage-wall-breath">
          <picture>
            <source srcSet="/stage/wall-khanna-1838.avif" type="image/avif" />
            <img data-lcp-wall data-lcp-stage-image src="/stage/wall-khanna-1838.webp" alt="" fetchPriority="high" />
          </picture>
        </div>
      </div>
    </div>
    <div className="stage-room-glow" aria-hidden="true" />
    <Poster />
    <div className="stage-room-treatment" aria-hidden="true" />
  </>;
}
