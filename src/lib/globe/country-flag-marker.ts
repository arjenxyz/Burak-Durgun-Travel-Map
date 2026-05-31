import { countryFlagUrl } from "@/lib/country-flag-url";

export type GlobeCountryMarker = {
  lat: number;
  lng: number;
  size: number;
  label: string;
  countryCode: string;
};

export function markerSizeFromVideoCount(videoCount: number): number {
  return 28 + Math.min(videoCount * 2, 14);
}

export function createCountryFlagElement(
  marker: GlobeCountryMarker,
  onClick: (countryCode: string) => void,
): HTMLElement {
  const el = document.createElement("div");
  el.className = "globe-flag-marker";
  el.style.width = `${marker.size}px`;
  el.style.height = `${marker.size}px`;
  el.title = marker.label;
  el.setAttribute("aria-label", marker.label);

  const img = document.createElement("img");
  img.src = countryFlagUrl(marker.countryCode);
  img.alt = "";
  img.draggable = false;
  img.loading = "lazy";

  img.onerror = () => {
    img.remove();
    el.classList.add("globe-flag-marker--fallback");
    el.textContent = marker.countryCode;
  };

  el.appendChild(img);
  el.onclick = (event) => {
    event.stopPropagation();
    onClick(marker.countryCode);
  };

  return el;
}
