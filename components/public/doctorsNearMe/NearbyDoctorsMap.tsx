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
    width: "280px",
    overflow: "hidden",
    borderRadius: "24px",
    fontFamily: "DM Sans, Arial, sans-serif",
    color: "#283C5D",
    background: "#ffffff",
    boxShadow: "0 24px 70px rgba(40, 60, 93, 0.18)",
  });

  const header = document.createElement("div");

  applyStyles(header, {
    position: "relative",
    padding: "18px",
    background:
      "linear-gradient(135deg, rgba(241,225,198,0.95), #ffffff 58%, rgba(206,181,145,0.42))",
    borderBottom: "1px solid rgba(206,181,145,0.25)",
  });

  const badge = document.createElement("div");
  badge.textContent = "Nearby doctor";

  applyStyles(badge, {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.88)",
    color: "#283C5D",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    boxShadow: "0 8px 18px rgba(40,60,93,0.08)",
  });

  const avatar = document.createElement("div");
  avatar.textContent = doctor.name.charAt(0).toUpperCase();

  applyStyles(avatar, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "58px",
    height: "58px",
    marginTop: "14px",
    borderRadius: "18px",
    border: "3px solid #ffffff",
    background: "#283C5D",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "900",
    boxShadow: "0 14px 30px rgba(40,60,93,0.20)",
  });

  header.appendChild(badge);
  header.appendChild(avatar);

  const body = document.createElement("div");

  applyStyles(body, {
    padding: "16px 18px 18px",
    background: "#ffffff",
  });

  const title = document.createElement("p");
  title.textContent = doctor.name;

  applyStyles(title, {
    margin: "0",
    fontSize: "17px",
    lineHeight: "1.2",
    fontWeight: "900",
    letterSpacing: "-0.02em",
    color: "#283C5D",
  });

  body.appendChild(title);

  if (doctor.clinicName) {
    const clinic = document.createElement("p");
    clinic.textContent = doctor.clinicName;

    applyStyles(clinic, {
      margin: "5px 0 0",
      fontSize: "12px",
      lineHeight: "1.35",
      fontWeight: "700",
      color: "rgba(40,60,93,0.62)",
    });

    body.appendChild(clinic);
  }

  const locationText = [doctor.city, doctor.country].filter(Boolean).join(", ");

  if (locationText) {
    const location = document.createElement("div");

    applyStyles(location, {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      marginTop: "12px",
      fontSize: "12px",
      fontWeight: "700",
      color: "rgba(40,60,93,0.58)",
    });

    const dot = document.createElement("span");

    applyStyles(dot, {
      width: "7px",
      height: "7px",
      borderRadius: "999px",
      background: "#CEB591",
      flexShrink: "0",
    });

    const locationLabel = document.createElement("span");
    locationLabel.textContent = locationText;

    location.appendChild(dot);
    location.appendChild(locationLabel);
    body.appendChild(location);
  }

  const metaParts: string[] = [];

  if (doctor.distanceKm !== null) {
    metaParts.push(`${doctor.distanceKm} km away`);
  }

  if (doctor.googleRating !== null) {
    metaParts.push(`★ ${doctor.googleRating.toFixed(1)}`);
  }

  if (metaParts.length > 0) {
    const meta = document.createElement("div");

    applyStyles(meta, {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "14px",
    });

    metaParts.forEach((part) => {
      const pill = document.createElement("span");
      pill.textContent = part;

      applyStyles(pill, {
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        padding: "7px 10px",
        borderRadius: "999px",
        background: "#F8F3EA",
        color: "#283C5D",
        fontSize: "11px",
        fontWeight: "800",
      });

      meta.appendChild(pill);
    });

    body.appendChild(meta);
  }

  const link = document.createElement("a");
  link.href = getDoctorProfileHref(doctor.slug);
  link.textContent = "View profile";

  applyStyles(link, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "999px",
    background: "#283C5D",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "900",
    letterSpacing: "0.02em",
    textDecoration: "none",
    boxSizing: "border-box",
  });

  body.appendChild(link);

  wrapper.appendChild(header);
  wrapper.appendChild(body);

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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY ?? "";

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
      setErrorMessage("Google Maps is not configured.");
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
          if (
            doctor.workLatitude === null ||
            doctor.workLongitude === null
          ) {
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
        setErrorMessage(
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