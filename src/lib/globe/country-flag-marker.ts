import { countryFlagUrl } from "@/lib/country-flag-url";

export type GlobeCountryMarker = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
};

const DEFAULT_PIN_SIZE = 32;

/** Uzak zoom'da biraz büyük, yakında küçük — ekranda her zaman okunur */
export function pinSizeForAltitude(altitude: number): number {
  return Math.round(Math.min(40, Math.max(28, 22 + altitude * 5)));
}

export function createFlagPinElement(
  marker: GlobeCountryMarker,
  onClick: (countryCode: string) => void,
): HTMLElement {
  const el = document.createElement("div");
  el.className = "globe-flag-pin";
  el.dataset.countryCode = marker.countryCode;
  el.style.setProperty("--pin-size", `${DEFAULT_PIN_SIZE}px`);
  el.title = marker.label;
  el.setAttribute("aria-label", marker.label);

  const disc = document.createElement("div");
  disc.className = "globe-flag-pin__disc";

  const img = document.createElement("img");
  img.className = "globe-flag-pin__img";
  img.src = countryFlagUrl(marker.countryCode, 80);
  img.alt = "";
  img.width = 80;
  img.height = 80;
  img.draggable = false;
  img.loading = "lazy";

  img.onerror = () => {
    img.remove();
    disc.classList.add("globe-flag-pin__disc--fallback");
    disc.textContent = marker.countryCode;
  };

  disc.appendChild(img);

  const banner = document.createElement("div");
  banner.className = "globe-flag-pin__banner";
  banner.setAttribute("aria-hidden", "true");
  const bannerImg = img.cloneNode(true) as HTMLImageElement;
  bannerImg.onerror = null;
  banner.appendChild(bannerImg);

  const tail = document.createElement("div");
  tail.className = "globe-flag-pin__tail";
  tail.setAttribute("aria-hidden", "true");

  el.appendChild(disc);
  el.appendChild(banner);
  el.appendChild(tail);

  el.onclick = (event) => {
    event.stopPropagation();
    onClick(marker.countryCode);
  };

  return el;
}

export function updateFlagPinSizes(container: HTMLElement, altitude: number) {
  const size = pinSizeForAltitude(altitude);
  container.querySelectorAll<HTMLElement>(".globe-flag-pin").forEach((pin) => {
    pin.style.setProperty("--pin-size", `${size}px`);
  });
}

export function updateFlagPinSelection(container: HTMLElement, selectedCode?: string) {
  container.querySelectorAll<HTMLElement>(".globe-flag-pin").forEach((pin) => {
    pin.classList.toggle("globe-flag-pin--selected", pin.dataset.countryCode === selectedCode);
  });
}
