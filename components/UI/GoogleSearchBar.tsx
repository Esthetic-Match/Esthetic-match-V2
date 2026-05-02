"use client";

import { useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";

const googleLibraries: "places"[] = ["places"];

export type GooglePlaceResult = {
  label: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  placeId: string;
  latitude: number | null;
  longitude: number | null;
};

type GooglePlacesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: GooglePlaceResult) => void;
  placeholder?: string;
  className?: string;
};

export default function GooglePlacesSearchBar({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a location",
  className = "",
}: GooglePlacesSearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY!,
    libraries: googleLibraries,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "place_id",
          "name",
        ],
        types: ["establishment", "geocode"],
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place) return;

      const components = place.address_components ?? [];

      const getComponent = (type: string) =>
        components.find((component) => component.types.includes(type))
          ?.long_name ?? "";

      const streetNumber = getComponent("street_number");
      const route = getComponent("route");

      const address =
        [streetNumber, route].filter(Boolean).join(" ") ||
        place.formatted_address ||
        place.name ||
        "";

      const city =
        getComponent("locality") ||
        getComponent("postal_town") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_1");

      const country = getComponent("country");
      const zipCode = getComponent("postal_code");

      const latitude = place.geometry?.location?.lat() ?? null;
      const longitude = place.geometry?.location?.lng() ?? null;

      const result: GooglePlaceResult = {
        label: place.name || place.formatted_address || address,
        address,
        city,
        country,
        zipCode,
        placeId: place.place_id ?? "",
        latitude,
        longitude,
      };

      onChange(result.label);
      onPlaceSelect(result);
    });
  }, [isLoaded, onChange, onPlaceSelect]);

  return (
    <div className={className}>
      <div className="relative">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
        />

        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-white/10 bg-white/90 
          px-11 pr-12 text-sm text-black shadow-md outline-none 
          placeholder:text-black/30 focus:border-[#d8bd8d]"
        />

        <MapPin
          size={17}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFD78C]"
        />
      </div>
    </div>
  );
}