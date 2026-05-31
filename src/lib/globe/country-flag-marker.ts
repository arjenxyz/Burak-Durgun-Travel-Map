import { countryFlagUrl } from "@/lib/country-flag-url";

export type GlobeCountryMarker = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
};

const MARKER_SELECTOR = "[data-globe-flag]";

/** Uzak zoom'da hafif büyük, ekranda kompakt kalır */
export function pinSizeForAltitude(altitude: number): number {
  return Math.round(Math.min(26, Math.max(18, 14 + altitude * 3)));
}

function applyRoundFlagStyle(el: HTMLButtonElement, size: number, selected = false) {
  Object.assign(el.style, {
    display: "block",
    padding: "0",
    margin: "0",
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    minHeight: `${size}px`,
    maxHeight: `${size}px`,
    border: selected ? "2px solid #fb923c" : "2px solid #ffffff",
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
    pointerEvents: "auto",
    background: "#18181b",
    boxShadow: selected
      ? "0 0 0 2px rgba(249, 115, 22, 0.45), 0 2px 8px rgba(0, 0, 0, 0.5)"
      : "0 2px 8px rgba(0, 0, 0, 0.5)",
    transform: "translate(-50%, -50%)",
    boxSizing: "border-box",
    lineHeight: "0",
    transition: "opacity 250ms ease, box-shadow 150ms ease",
  });
}

export function createFlagPinElement(
  marker: GlobeCountryMarker,
  onClick: (countryCode: string) => void,
): HTMLElement {
  const size = pinSizeForAltitude(2.5);
  const el = document.createElement("button");
  el.type = "button";
  el.dataset.globeFlag = "true";
  el.dataset.countryCode = marker.countryCode;
  el.title = marker.label;
  el.setAttribute("aria-label", marker.label);
  applyRoundFlagStyle(el, size);

  const img = document.createElement("img");
  img.src = countryFlagUrl(marker.countryCode, 40);
  img.alt = "";
  img.draggable = false;
  img.loading = "lazy";
  Object.assign(img.style, {
    display: "block",
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    pointerEvents: "none",
  });

  img.onerror = () => {
    img.remove();
    el.textContent = marker.countryCode;
    Object.assign(el.style, {
      color: "#fff",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing: "0.04em",
      background: "#f97316",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
  };

  el.appendChild(img);
  el.onclick = (event) => {
    event.stopPropagation();
    onClick(marker.countryCode);
  };

  return el;
}

export function updateFlagPinSizes(container: HTMLElement, altitude: number) {
  const size = pinSizeForAltitude(altitude);
  container.querySelectorAll<HTMLButtonElement>(MARKER_SELECTOR).forEach((pin) => {
    const selected = pin.dataset.selected === "true";
    applyRoundFlagStyle(pin, size, selected);
  });
}

export function updateFlagPinSelection(container: HTMLElement, selectedCode?: string) {
  container.querySelectorAll<HTMLButtonElement>(MARKER_SELECTOR).forEach((pin) => {
    const selected = pin.dataset.countryCode === selectedCode;
    pin.dataset.selected = selected ? "true" : "false";
    const size = parseInt(pin.style.width, 10) || pinSizeForAltitude(2.5);
    applyRoundFlagStyle(pin, size, selected);
  });
}
