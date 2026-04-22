import BackButton from "@/components/UI/BackButton";
import MessageText from "@/components/UI/MessageText";
import TextInput from "@/components/UI/TextInput";
import type { DoctorSignUpProps } from "@/app/sign-up/types";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

type MultiSelectDropdownProps = {
  label: string;
  summaryLabel: string;
  items: readonly { id: string; label: string }[];
  selectedItems: string[];
  onToggle: (id: string) => void;
};

function MultiSelectDropdown({
  label,
  summaryLabel,
  items,
  selectedItems,
  onToggle,
}: MultiSelectDropdownProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <details className="rounded border">
        <summary className="cursor-pointer px-4 py-3 text-sm text-gray-700">
          {selectedItems.length > 0
            ? `${selectedItems.length} selected`
            : summaryLabel}
        </summary>

        <div className="max-h-64 space-y-3 overflow-y-auto border-t px-4 py-3">
          {items.map((item) => {
            const checked = selectedItems.includes(item.id);

            return (
              <label
                key={item.id}
                className="flex items-center gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </details>
    </div>
  );
}

export default function DoctorSignUpForm({
  name,
  dob,
  email,
  password,

  selectedSpecialties,
  selectedServiceCategories,
  selectedServices,
  selectedSubzones,

  otherSpecialtyText,

  errorMessage,
  isLoading,

  onBack,
  onSubmit,

  onNameChange,
  onDobChange,
  onEmailChange,
  onPasswordChange,

  onToggleSpecialty,
  onToggleServiceCategory,
  onToggleService,
  onToggleSubzone,

  onOtherSpecialtyTextChange,
}: DoctorSignUpProps) {
  const hasOtherSpecialty = selectedSpecialties.includes("other_specialty");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <BackButton onBack={onBack} />

      <div>
        <p className="mb-2 text-sm font-medium">Signing up as Doctor</p>
      </div>

      <TextInput
        placeholder="Name"
        value={name}
        onChange={onNameChange}
      />

      <TextInput
        placeholder="Date of Birth"
        type="date"
        value={dob}
        onChange={onDobChange}
      />

      <TextInput
        placeholder="Email"
        type="email"
        value={email}
        onChange={onEmailChange}
      />

      <TextInput
        placeholder="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
      />

      <MultiSelectDropdown
        label="Specialties"
        summaryLabel="Select specialties"
        items={DoctorCatalog.specialties}
        selectedItems={selectedSpecialties}
        onToggle={onToggleSpecialty}
      />

      {hasOtherSpecialty ? (
        <TextInput
          placeholder="Please specify other specialty"
          value={otherSpecialtyText}
          onChange={onOtherSpecialtyTextChange}
        />
      ) : null}

      <MultiSelectDropdown
        label="Service Categories"
        summaryLabel="Select service categories"
        items={DoctorCatalog.serviceCategories}
        selectedItems={selectedServiceCategories}
        onToggle={onToggleServiceCategory}
      />

      <MultiSelectDropdown
        label="Services"
        summaryLabel="Select services"
        items={DoctorCatalog.services.map((service) => ({
          id: service.id,
          label: service.label,
        }))}
        selectedItems={selectedServices}
        onToggle={onToggleService}
      />

      <MultiSelectDropdown
        label="Subzones"
        summaryLabel="Select subzones"
        items={DoctorCatalog.subzones.map((subzone) => ({
          id: subzone.id,
          label: subzone.label,
        }))}
        selectedItems={selectedSubzones}
        onToggle={onToggleSubzone}
      />

      <MessageText message={errorMessage} variant="error" />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {isLoading ? "Creating account..." : "Sign up as Doctor"}
      </button>
    </form>
  );
}