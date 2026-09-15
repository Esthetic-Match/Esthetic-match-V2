"use client";

import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ProcedureAdminClient, {
  type AdminProcedure,
} from "@/components/dashboard/admin/ProcedureAdminClient";

type ProceduresResponse = {
  success?: boolean;
  procedures?: AdminProcedure[];
  error?: string;
};

export default function AdminProcedureDefaults() {
  const [procedures, setProcedures] = useState<
    AdminProcedure[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const loadProcedures = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/admin/procedures",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as ProceduresResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load procedures."
          );
        }

        setProcedures(
          data.procedures ?? []
        );
      } catch (loadError) {
        console.error(
          "Failed to load procedures:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load procedures."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadProcedures();
  }, [loadProcedures]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-[#283C5D]/10 bg-white p-10 shadow-sm">
        <div className="flex items-center justify-center gap-3 text-sm font-medium text-[#283C5D]/60">
          <Loader2 className="h-5 w-5 animate-spin" />

          Loading procedure details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <div className="flex-1">
            <p className="font-semibold text-red-700">
              Could not load procedures
            </p>

            <p className="mt-1 text-sm text-red-600/80">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadProcedures()
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#283C5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f304d]"
            >
              <RefreshCw className="h-4 w-4" />

              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (procedures.length === 0) {
    return (
      <div className="rounded-[28px] border border-[#283C5D]/10 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-[#283C5D]/60">
          No procedures found.
        </p>
      </div>
    );
  }

  return (
    <ProcedureAdminClient
      initialProcedures={procedures}
    />
  );
}