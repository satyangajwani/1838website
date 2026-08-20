import { Specular } from './specular';

export function Poster() {
  return <div data-stage-object className="stage-object" aria-hidden="true">
    <div data-layer="pedestal" data-depth="0.055" className="stage-layer stage-pedestal">
      <picture>
        <source type="image/avif" srcSet="/stage/pedestal-only-1080.avif 1080w, /stage/pedestal-only-1440.avif 1440w, /stage/pedestal-only-1920.avif 1920w" sizes="(max-aspect-ratio: 4/5) 96vw, 68vw" />
        <img src="/stage/pedestal-only-1440.webp" srcSet="/stage/pedestal-only-1080.webp 1080w, /stage/pedestal-only-1440.webp 1440w, /stage/pedestal-only-1920.webp 1920w" sizes="(max-aspect-ratio: 4/5) 96vw, 68vw" alt="" />
      </picture>
    </div>
    <div data-layer="card-stand" data-depth="0.035" className="stage-layer stage-card-stand">
      <div className="stage-card-ceremony">
        <div className="stage-card-breath">
          <picture>
            <source type="image/avif" srcSet="/stage/card-on-stand-noname-1080.avif 1080w, /stage/card-on-stand-noname-1440.avif 1440w, /stage/card-on-stand-noname-1920.avif 1920w" sizes="(max-aspect-ratio: 4/5) 96vw, 68vw" />
            <img data-baked-copy="excluded" data-lcp-stage-image src="/stage/card-on-stand-noname-1440.webp" srcSet="/stage/card-on-stand-noname-1080.webp 1080w, /stage/card-on-stand-noname-1440.webp 1440w, /stage/card-on-stand-noname-1920.webp 1920w" sizes="(max-aspect-ratio: 4/5) 96vw, 68vw" alt="" fetchPriority="high" />
          </picture>
        </div>
      </div>
    </div>
    <Specular />
  </div>;
}
