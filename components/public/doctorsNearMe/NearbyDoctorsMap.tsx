"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export type NearbyDoctorMapItem = {
  id: string;
  slug: string;
  name: string;
  clinicName: string | null;
  city: string | null;
  country: string | null;
  workLatitude: number | null;
  workLongitude: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  distanceKm: number | null;
};

type NearbyDoctorsMapProps = {
  doctors: NearbyDoctorMapItem[];
  selectedDoctorId?: string | null;
  className?: string;
};

let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-script="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Could not load Google Maps.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsScript = "true";

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Could not load Google Maps.")),
      { once: true }
    );

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

function getDoctorProfileHref(slug: string) {
  return `/doctors/${slug}`;
}

function applyStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
) {
  Object.assign(element.style, styles);
}

function createInfoWindowContent(doctor: NearbyDoctorMapItem) {
  const wrapper = document.createElement("div");

  applyStyles(wrapper, {
    width: "260px",
    padding: "18px",
    borderRadius: "20px",
    fontFamily: "DM Sans, Arial, sans-serif",
    color: "#283C5D",
    background: "#ffffff",
    boxSizing: "border-box",
  });

  // Doctor name
  const title = document.createElement("p");
  title.textContent = doctor.name;

  applyStyles(title, {
    margin: "0",
    fontSize: "17px",
    lineHeight: "1.3",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    color: "#283C5D",
  });

  wrapper.appendChild(title);

  // Distance
  if (doctor.distanceKm !== null) {
    const distance = document.createElement("p");
    distance.textContent = `${doctor.distanceKm} km away`;

    applyStyles(distance, {
      margin: "7px 0 0",
      fontSize: "12px",
      lineHeight: "1.4",
      fontWeight: "700",
      color: "#CEB591",
    });

    wrapper.appendChild(distance);
  }

  // Address
  const locationText = [doctor.city, doctor.country]
    .filter(Boolean)
    .join(", ");

  if (locationText) {
    const address = document.createElement("div");

    applyStyles(address, {
      display: "flex",
      alignItems: "flex-start",
      gap: "7px",
      marginTop: "10px",
      color: "rgba(40, 60, 93, 0.62)",
    });

    const dot = document.createElement("span");

    applyStyles(dot, {
      width: "7px",
      height: "7px",
      marginTop: "5px",
      borderRadius: "999px",
      background: "#CEB591",
      flexShrink: "0",
    });

    const addressText = document.createElement("span");
    addressText.textContent = locationText;

    applyStyles(addressText, {
      fontSize: "12px",
      lineHeight: "1.5",
      fontWeight: "600",
    });

    address.appendChild(dot);
    address.appendChild(addressText);
    wrapper.appendChild(address);
  }

  // View profile button
  const link = document.createElement("a");
  link.href = getDoctorProfileHref(doctor.slug);
  link.textContent = "View profile";

  applyStyles(link, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "16px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#283C5D",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "800",
    textDecoration: "none",
    boxSizing: "border-box",
  });

  wrapper.appendChild(link);

  return wrapper;
}

export default function NearbyDoctorsMap({
  doctors,
  selectedDoctorId = null,
  className = "",
}: NearbyDoctorsMapProps) {
  const t = useTranslations("doctor.doctor.nearme");
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());

  const [mapLoadErrorMessage, setMapLoadErrorMessage] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY ?? "";

  const configurationErrorMessage = apiKey
  ? null
  : "Google Maps is not configured.";

const errorMessage = configurationErrorMessage ?? mapLoadErrorMessage;

  const doctorsWithLocation = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          doctor.workLatitude !== null &&
          doctor.workLongitude !== null &&
          Number.isFinite(doctor.workLatitude) &&
          Number.isFinite(doctor.workLongitude)
      ),
    [doctors]
  );

useEffect(() => {
  if (!apiKey) {
    return;
  }

  if (!mapElementRef.current || doctorsWithLocation.length === 0) {
    return;
  }

  let isMounted = true;

  async function initializeMap() {
    try {
      await loadGoogleMaps(apiKey);

      if (!isMounted || !mapElementRef.current) return;

      setMapLoadErrorMessage(null);

      markersRef.current.forEach((marker) => marker.setMap(null));
      infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
      markersRef.current.clear();
      infoWindowsRef.current.clear();

      const firstDoctor = doctorsWithLocation[0];

      if (
        firstDoctor.workLatitude === null ||
        firstDoctor.workLongitude === null
      ) {
        return;
      }

      const map = new google.maps.Map(mapElementRef.current, {
        center: {
          lat: firstDoctor.workLatitude,
          lng: firstDoctor.workLongitude,
        },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      googleMapRef.current = map;

      const bounds = new google.maps.LatLngBounds();

      doctorsWithLocation.forEach((doctor) => {
        if (doctor.workLatitude === null || doctor.workLongitude === null) {
          return;
        }

        const position = {
          lat: doctor.workLatitude,
          lng: doctor.workLongitude,
        };

        bounds.extend(position);

        const marker = new google.maps.Marker({
          position,
          map,
          title: doctor.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(doctor),
          maxWidth: 320,
          pixelOffset: new google.maps.Size(0, -8),
        });

        marker.addListener("click", () => {
          infoWindowsRef.current.forEach((windowItem) => windowItem.close());
          infoWindow.open({
            map,
            anchor: marker,
          });
        });

        markersRef.current.set(doctor.id, marker);
        infoWindowsRef.current.set(doctor.id, infoWindow);
      });

      if (doctorsWithLocation.length === 1) {
        map.setZoom(14);
        map.setCenter(bounds.getCenter());
      } else {
        map.fitBounds(bounds, 80);
      }
    } catch (error) {
      setMapLoadErrorMessage(
        error instanceof Error ? error.message : "Could not load Google Maps."
      );
    }
  }

  void initializeMap();

  return () => {
    isMounted = false;

    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    markersRef.current.clear();
    infoWindowsRef.current.clear();
    googleMapRef.current = null;
  };
}, [apiKey, doctorsWithLocation]);

  useEffect(() => {
    if (!selectedDoctorId) return;

    const map = googleMapRef.current;
    const marker = markersRef.current.get(selectedDoctorId);
    const infoWindow = infoWindowsRef.current.get(selectedDoctorId);

    if (!map || !marker || !infoWindow) return;

    const position = marker.getPosition();

    if (!position) return;

    infoWindowsRef.current.forEach((windowItem) => windowItem.close());

    map.panTo(position);
    map.setZoom(Math.max(map.getZoom() ?? 14, 15));

    infoWindow.open({
      map,
      anchor: marker,
    });
  }, [selectedDoctorId]);

  if (doctorsWithLocation.length === 0) {
    return null;
  }

  return (
    <section
      className={`overflow-hidden rounded-[2rem] border border-[#CEB591]/25 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.08)] ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-[#CEB591]/20 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F1E1C6]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#283C5D]">
            <MapPin className="h-3.5 w-3.5 text-[#CEB591]" />
            {t("doctorMap")}
          </div>
        </div>

        <p className="text-sm font-semibold text-[#283C5D]/55">
          {doctorsWithLocation.length} {t("location")} 
          {doctorsWithLocation.length === 1 ? "" : "s"}
        </p>
      </div>

      {errorMessage ? (
        <div className="p-6 text-sm font-semibold text-[#283C5D]/65">
          {errorMessage}
        </div>
      ) : (
        <div ref={mapElementRef} className="h-[360px] w-full md:h-[480px]" />
      )}
    </section>
  );
}