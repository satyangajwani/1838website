import { Specular } from './specular';

export function Poster() {
  return <div data-stage-object className="stage-object" aria-hidden="true">
    <div data-layer="card-stand" data-depth="0.035" className="stage-layer stage-card-stand">
      <div className="stage-card-ceremony">
        <div className="stage-card-breath">
          <picture>
            <source srcSet="/stage/card-clean-4fd2.avif" type="image/avif" />
            <img data-baked-copy="excluded" data-lcp-stage-image src="/stage/card-clean-4fd2.webp" alt="" fetchPriority="high" />
          </picture>
          <span className="stage-stand" />
          <span className="stage-contact-shadow" />
          <span className="stage-reflection" />
        </div>
      </div>
    </div>
    <Specular />
  </div>;
}
