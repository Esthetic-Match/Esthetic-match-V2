// components/dashboard/admin/DoctorProfilesPlanTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Crown, Loader2, ShieldCheck } from "lucide-react";

type DoctorProfilePlan = {
  id: string;
  clinicName: string;
  paidPlan: string | null;
  subscriptionPlan: string | null;
  user: {
    name: string | null;
    email: string;
  };
};

function BooleanToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#d8bd8d]" : "bg-[#283C5D]/15"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function StatusPill({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        active
          ? "bg-[#FAF2DE] text-[#283C5D]"
          : "bg-[#283C5D]/10 text-[#283C5D]/60"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export default function DoctorProfilesPlanTable() {
  const [profiles, setProfiles] = useState<DoctorProfilePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch("/api/admin/doctor-plans/plans");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load doctor profiles.");
        }

        setProfiles(data.doctorProfiles);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  async function updatePaidPlan(doctorProfileId: string, isStandard: boolean) {
    const previousProfiles = profiles;

    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) =>
        profile.id === doctorProfileId
          ? { ...profile, paidPlan: isStandard ? "standard" : "free" }
          : profile
      )
    );

    try {
      setUpdatingId(doctorProfileId);

      const res = await fetch(
        `/api/admin/doctor-plans/plans/${doctorProfileId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isStandard }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not update paid plan.");
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === doctorProfileId ? data.doctorProfile : profile
        )
      );
    } catch (error) {
      console.error(error);
      setProfiles(previousProfiles);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            Doctor Plans
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            Doctor Premium Plan Access
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#283C5D]/60">
            Toggle between paid and free plan access. Subscription payment status is read-only.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#d8bd8d]">
          <Crown size={26} />
        </div>
      </div>

      <div className="max-h-[620px] overflow-auto rounded-2xl border border-[#283C5D]/10">
        <table className="min-w-[950px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#FAF9F7] text-xs uppercase tracking-[0.18em] text-[#283C5D]/60">
            <tr>
              <th className="px-5 py-4 font-bold">Clinic</th>
              <th className="px-5 py-4 font-bold">Doctor Email</th>
              <th className="px-5 py-4 font-bold">current Plan</th>
              <th className="px-5 py-4 font-bold">Give Premium Access</th>
              <th className="px-5 py-4 font-bold">Paid Subscription</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#283C5D]/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />
                  </div>
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[#283C5D]/60"
                >
                  No doctor profiles found.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => {
                const isStandard = profile.paidPlan === "standard";
                const hasPaidSubscription = profile.subscriptionPlan === "premium";
                const isUpdating = updatingId === profile.id;

                return (
                  <tr
                    key={profile.id}
                    className="bg-white transition hover:bg-[#FAF9F7]"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-semibold text-[#283C5D]">
                        {profile.clinicName}
                      </p>
                      <p className="mt-1 text-xs text-[#283C5D]/50">
                        {profile.user.name || "Unnamed doctor"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[#283C5D]/65">
                      {profile.user.email}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusPill
                        active={isStandard}
                        activeLabel="premium"
                        inactiveLabel="Free"
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <BooleanToggle
                        checked={isStandard}
                        disabled={isUpdating}
                        onChange={(checked) =>
                          updatePaidPlan(profile.id, checked)
                        }
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck
                          size={15}
                          className={
                            hasPaidSubscription
                              ? "text-[#d8bd8d]"
                              : "text-[#283C5D]/30"
                          }
                        />
                        <StatusPill
                          active={hasPaidSubscription}
                          activeLabel="Yes"
                          inactiveLabel="No"
                        />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}