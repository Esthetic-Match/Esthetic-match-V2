import BackButton from "@/components/UI/BackButton";
import MessageText from "@/components/UI/MessageText";
import TextInput from "@/components/UI/TextInput";
import type { DoctorSignUpProps } from "@/app/sign-up/types";
import { DoctorCatalog } from "@/lib/doctorCatalogue";

type MultiSelectDropdownProps = {
  label: string;
  summaryLabel: string;
  items: readonly string[];
  selectedItems: string[];
  onToggle: (value: string) => void;
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
            const checked = selectedItems.includes(item);

            return (
              <label key={item} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                />
                <span>{item}</span>
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
  onToggleService,
  onToggleSubzone,

  onOtherSpecialtyTextChange,
}: DoctorSignUpProps) {
  const hasOtherSpecialty = selectedSpecialties.includes("other specialty");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <BackButton onBack={onBack} />

      <div>
        <p className="mb-2 text-sm font-medium">Signing up as Doctor</p>
      </div>

      <TextInput placeholder="Name" value={name} onChange={onNameChange} />

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
        label={DoctorCatalog.specialties.label}
        summaryLabel="Select specialties"
        items={DoctorCatalog.specialties.items}
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

      {DoctorCatalog.categories.map((category) => (
        <MultiSelectDropdown
          key={category.id}
          label={`${category.number}) ${category.label}`}
          summaryLabel={`Select ${category.label.toLowerCase()} services`}
          items={category.items}
          selectedItems={selectedServices}
          onToggle={onToggleService}
        />
      ))}

      <MultiSelectDropdown
        label={DoctorCatalog.subzones.faceAndGeneralAreas.label}
        summaryLabel="Select face & general areas"
        items={DoctorCatalog.subzones.faceAndGeneralAreas.items}
        selectedItems={selectedSubzones}
        onToggle={onToggleSubzone}
      />

      <MultiSelectDropdown
        label={DoctorCatalog.subzones.bodySubzones.label}
        summaryLabel="Select body subzones"
        items={DoctorCatalog.subzones.bodySubzones.items}
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