export type AccountType = "patient" | "doctor" | null;

export type AccountTypeSelectorProps = {
  infoMessage: string;
  onSelectPatient: () => void;
  onSelectDoctor: () => void;
};

export type PatientSignUpFormProps = {
  name: string;
  dob: string;
  email: string;
  password: string;
  errorMessage: string;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export type DoctorSignUpProps = {
  name: string;
  dob: string;
  email: string;
  password: string;

  selectedSpecialties: string[];
  selectedServiceCategories: string[];
  selectedServices: string[];

  otherSpecialtyText: string;

  errorMessage: string;
  isLoading: boolean;

  clinicName: string;
  workAddress: string;
  city: string;
  country: string;
  zipCode: string;

  googlePlaceId?: string;
  workLatitude?: number;
  workLongitude?: number;
  
  onGooglePlaceIdChange: (value: string) => void;
  onWorkLatitudeChange: (value: number) => void;
  onWorkLongitudeChange: (value: number) => void;

  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  onClinicNameChange: (value: string) => void;
  onWorkAddressChange: (value: string) => void;

  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;

  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;

  onToggleSpecialty: (id: string) => void;
  onToggleServiceCategory: (id: string) => void;
  onToggleService: (id: string) => void;

  onOtherSpecialtyTextChange: (value: string) => void;
};

export type MultiSelectOption = {
  id: string;
  label: string;
};

export type Procedure = {
  id: string;
  name: string;
};

export type Subcategory = {
  subcategory: string;
  procedures: readonly Procedure[];
};

export type Category = {
  category: string;
  subcategories: readonly Subcategory[];
};