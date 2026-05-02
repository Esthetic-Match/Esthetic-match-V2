"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeClosed,
  Mail,
  User,
  MapPin,
  Building2,
} from "lucide-react";
import { useJsApiLoader } from "@react-google-maps/api";
import InputField from "../UI/InputField";
import { useTranslations } from "next-intl";

const googleLibraries: "places"[] = ["places"];

type DoctorAccountDetailsStepProps = {
  name: string;
  dob: string;
  email: string;
  password: string;
  confirmPassword: string;

  clinicName: string;
  workAddress: string;
  city: string;
  country: string;
  zipCode: string;
  

  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;

  onClinicNameChange: (value: string) => void;
  onWorkAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;

  onGooglePlaceIdChange?: (value: string) => void;
  onWorkLatitudeChange?: (value: number) => void;
  onWorkLongitudeChange?: (value: number) => void;
};

export default function DoctorAccountDetailsStep({
  name,
  email,
  password,
  confirmPassword,
  clinicName,
  workAddress,
  city,
  country,
  zipCode,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onClinicNameChange,
  onWorkAddressChange,
  onCityChange,
  onCountryChange,
  onZipCodeChange,
  onGooglePlaceIdChange,
  onWorkLatitudeChange,
  onWorkLongitudeChange,
}: DoctorAccountDetailsStepProps) {
  const t = useTranslations("signUp.signUpForm");

  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    autocompleteRef.current.addListener("place_changed", () => {
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
  }, [
    isLoaded,
    onWorkAddressChange,
    onCityChange,
    onCountryChange,
    onZipCodeChange,
    onGooglePlaceIdChange,
    onWorkLatitudeChange,
    onWorkLongitudeChange,
  ]);

  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center">
        <p className="mt-2 max-w-xs text-xs leading-tight text-black/30">
          {t("heading")}
        </p>
      </div>

      <InputField
        label={t("FullName")}
        placeholder={t("NameDescription")}
        value={name}
        onChange={onNameChange}
        icon={<User size={15} />}
      />

      <InputField
        label={t("ClinicName")}
        placeholder={t("ClinicNameDescription")}
        value={clinicName}
        onChange={onClinicNameChange}
        icon={<Building2 size={15} />}
      />

      <InputField
        ref={addressInputRef}
        label={t("ClinicAddress")}
        placeholder={t("ClinicAddressDescription")}
        value={workAddress}
        onChange={onWorkAddressChange}
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

      <InputField
        label={t("Email")}
        placeholder={t("EmailDescription")}
        type="email"
        value={email}
        onChange={onEmailChange}
        icon={<Mail size={15} />}
      />

      <InputField
        label={t("Password")}
        placeholder={t("PasswordDescription")}
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={onPasswordChange}
        icon={
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label="Toggle password visibility"
            className="text-[#f4e4c6]"
          >
            {showPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <InputField
        label={t("ConfirmPassword")}
        placeholder={t("ConfirmPasswordDescription")}
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        icon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label="Toggle confirm password visibility"
            className="text-[#f4e4c6]"
          >
            {showConfirmPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
          </button>
        }
      />
    </>
  );
}