/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module "globe.gl" {
  type GlobeInstance = {
    (element: HTMLElement): GlobeInstance;
    globeImageUrl(url: string): GlobeInstance;
    bumpImageUrl(url: string): GlobeInstance;
    backgroundImageUrl(url: string): GlobeInstance;
    pointsData(data: object[]): GlobeInstance;
    pointAltitude(accessor: string): GlobeInstance;
    pointColor(accessor: string): GlobeInstance;
    pointLabel(accessor: string): GlobeInstance;
    onPointClick(cb: (point: object) => void): GlobeInstance;
    width(w: number): GlobeInstance;
    height(h: number): GlobeInstance;
    controls(): { autoRotate: boolean; autoRotateSpeed: number };
  };

  const Globe: GlobeInstance;
  export default Globe;
}
