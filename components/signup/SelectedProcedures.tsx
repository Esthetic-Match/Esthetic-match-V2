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
    <div className="space-y-2 rounded-xl border p-3 bg-[#283C5D]">
      <p className="text-sm font-normal text-white">Selected procedures</p>
      <div className="border-t border-white/40 my-3" />

      <div className="flex flex-wrap gap-2 ">
        {selectedProcedures.map((procedure) => (
          <button
            key={procedure.id}
            type="button"
            onClick={() => onRemoveProcedure(procedure.id)}
            className="flex items-center gap-2 rounded-full border bg-gray-300 px-3 py-1 text-sm cursor-pointer hover:bg-[#94604C] hover:border-[#94604C] hover:scale-[1.01] active:scale-[0.98]"
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