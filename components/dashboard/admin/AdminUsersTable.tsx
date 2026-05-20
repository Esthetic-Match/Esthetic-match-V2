// components/dashboard/admin/AdminUsersTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UsersRound } from "lucide-react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  onboardingCompleted: boolean;
  emailVerified: boolean;
  createdAt: string;
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

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Could not load users.");
        }

        setUsers(data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  async function updateUser(
    userId: string,
    field: "emailVerified" | "onboardingCompleted",
    value: boolean
  ) {
    const previousUsers = users;

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, [field]: value } : user
      )
    );

    try {
      setUpdatingUserId(userId);

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not update user.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? data.user : user))
      );
    } catch (error) {
      console.error(error);
      setUsers(previousUsers);
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            Users
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            Recent Sign Ups
          </h2>

          <p className="mt-2 text-sm text-[#283C5D]/60">
            Manage onboarding and email verification status.
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF2DE] text-[#d8bd8d]">
          <UsersRound size={26} />
        </div>
      </div>

      <div className="max-h-[620px] overflow-auto rounded-2xl border border-[#283C5D]/10">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#FAF9F7] text-xs uppercase tracking-[0.18em] text-[#283C5D]/60">
            <tr>
              <th className="px-5 py-4 font-bold">Name</th>
              <th className="px-5 py-4 font-bold">Email</th>
              <th className="px-5 py-4 font-bold">Role</th>
              <th className="px-5 py-4 font-bold">Onboarding</th>
              <th className="px-5 py-4 font-bold">Email Verified</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#283C5D]/60">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isUpdating = updatingUserId === user.id;

                return (
                  <tr key={user.id} className="bg-white transition hover:bg-[#FAF9F7]">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#283C5D]">
                      {user.name || "Unnamed User"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[#283C5D]/65">
                      {user.email}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF2DE] px-3 py-1 text-xs font-bold text-[#283C5D]">
                        <ShieldCheck size={13} />
                        {user.role}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <BooleanToggle
                        checked={user.onboardingCompleted}
                        disabled={isUpdating}
                        onChange={(checked) =>
                          updateUser(user.id, "onboardingCompleted", checked)
                        }
                      />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <BooleanToggle
                        checked={user.emailVerified}
                        disabled={isUpdating}
                        onChange={(checked) =>
                          updateUser(user.id, "emailVerified", checked)
                        }
                      />
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