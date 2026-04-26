import type { Procedure } from "@/app/sign-up/types";

type SelectedProceduresProps = {
  selectedProcedures: Procedure[];
  onRemoveProcedure: (procedureId: string) => void;
};

export default function SelectedProcedures({
  selectedProcedures,
  onRemoveProcedure,
}: SelectedProceduresProps) {
  if (selectedProcedures.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 rounded border bg-gray-50 p-3">
      <p className="text-sm font-medium">Selected procedures</p>

      <div className="flex flex-wrap gap-2">
        {selectedProcedures.map((procedure) => (
          <button
            key={procedure.id}
            type="button"
            onClick={() => onRemoveProcedure(procedure.id)}
            className="flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm"
          >
            <span>{procedure.name}</span>
            <span aria-hidden="true" className="text-gray-500">
              ×
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}