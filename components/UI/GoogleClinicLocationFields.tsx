// components/DoctorSignup/GoogleClinicLocationFields.tsx
"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useTranslations } from "next-intl";
import InputField from "../UI/InputField";

const googleLibraries: "places"[] = ["places"];

type GoogleClinicLocationFieldsProps = {
  workAddress: string;
  city: string;
  country: string;
  zipCode: string;

  onWorkAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;

  onGooglePlaceIdChange?: (value: string) => void;
  onWorkLatitudeChange?: (value: number) => void;
  onWorkLongitudeChange?: (value: number) => void;
  onGoogleMapsUriChange?: (value: string | null) => void;
  onGoogleRatingChange?: (value: number | null) => void;
  onGoogleReviewCountChange?: (value: number | null) => void;
};

export default function GoogleClinicLocationFields({
  workAddress,
  city,
  country,
  zipCode,
  onWorkAddressChange,
  onCityChange,
  onCountryChange,
  onZipCodeChange,
  onGooglePlaceIdChange,
  onWorkLatitudeChange,
  onWorkLongitudeChange,
  onGoogleMapsUriChange,
  onGoogleRatingChange,
  onGoogleReviewCountChange,
}: GoogleClinicLocationFieldsProps) {
  const t = useTranslations("signUp.signUpForm");

  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY!,
    libraries: googleLibraries,
  });

  useEffect(() => {
    if (!isLoaded || !addressInputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      addressInputRef.current,
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

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place) return;

      const components = place.address_components ?? [];

      const getComponent = (type: string) =>
        components.find((component) => component.types.includes(type))
          ?.long_name ?? "";

      const streetNumber = getComponent("street_number");
      const route = getComponent("route");

      const selectedAddress =
        [streetNumber, route].filter(Boolean).join(" ") ||
        place.formatted_address ||
        place.name ||
        "";

      const selectedCity =
        getComponent("locality") ||
        getComponent("postal_town") ||
        getComponent("administrative_area_level_2") ||
        getComponent("administrative_area_level_1");

      const selectedCountry = getComponent("country");
      const selectedZipCode = getComponent("postal_code");

      onWorkAddressChange(selectedAddress);
      onCityChange(selectedCity);
      onCountryChange(selectedCountry);
      onZipCodeChange(selectedZipCode);

      if (place.place_id) {
        onGooglePlaceIdChange?.(place.place_id);
        onGoogleMapsUriChange?.(null);
        onGoogleRatingChange?.(null);
        onGoogleReviewCountChange?.(null);
      }

      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (typeof lat === "number") {
        onWorkLatitudeChange?.(lat);
      }

      if (typeof lng === "number") {
        onWorkLongitudeChange?.(lng);
      }
    });

    return () => {
      listener.remove();
    };
}, [
  isLoaded,
  onWorkAddressChange,
  onCityChange,
  onCountryChange,
  onZipCodeChange,
  onGooglePlaceIdChange,
  onGoogleMapsUriChange,
  onGoogleRatingChange,
  onGoogleReviewCountChange,
  onWorkLatitudeChange,
  onWorkLongitudeChange,
]);

  return (
    <>
      <InputField
        ref={addressInputRef}
        label={t("ClinicAddress")}
        placeholder={t("ClinicAddressDescription")}
        value={workAddress}
        onChange={(value) => {
          onWorkAddressChange(value);

          onGooglePlaceIdChange?.("");
          onGoogleMapsUriChange?.(null);
          onGoogleRatingChange?.(null);
          onGoogleReviewCountChange?.(null);

          onWorkLatitudeChange?.(0);
          onWorkLongitudeChange?.(0);
        }}
        icon={<MapPin size={15} />}
      />

      <InputField
        label={t("City")}
        placeholder={t("CityDescription")}
        value={city}
        onChange={onCityChange}
        icon={<MapPin size={15} />}
      />

      <InputField
        label={t("Country")}
        placeholder={t("CountryDescription")}
        value={country}
        onChange={onCountryChange}
        icon={<MapPin size={15} />}
      />

      <InputField
        label={t("ClinicZipCode")}
        placeholder={t("ClinicZipCodeDescription")}
        value={zipCode}
        onChange={onZipCodeChange}
        icon={<MapPin size={15} />}
      />
    </>
  );
}