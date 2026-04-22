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
  selectedSubzones: string[];

  otherSpecialtyText: string;

  errorMessage: string;
  isLoading: boolean;

  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;

  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;

  onToggleSpecialty: (id: string) => void;
  onToggleServiceCategory: (id: string) => void;
  onToggleService: (id: string) => void;
  onToggleSubzone: (id: string) => void;

  onOtherSpecialtyTextChange: (value: string) => void;
};