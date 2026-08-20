import { Specular } from './specular';

export function Poster() {
  return <div data-stage-object className="stage-object" aria-hidden="true">
    <picture data-layer="card-stand" data-depth="0.035" className="stage-layer stage-card-stand">
      <source srcSet="/stage/card-clean-4fd2.avif" type="image/avif" />
      <img data-baked-copy="excluded" data-lcp-stage-image src="/stage/card-clean-4fd2.webp" alt="" />
      <span className="stage-stand" />
      <span className="stage-contact-shadow" />
      <span className="stage-reflection" />
    </picture>
    <Specular />
  </div>;
}
