// components/dashboard/admin/AdminUsersTable.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

type AdminUserRole =
  | "PATIENT"
  | "DOCTOR"
  | "ADMIN";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: AdminUserRole;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  createdAt: string;
};

type BooleanToggleType =
  | "onboarding"
  | "emailVerification";

type BooleanToggleProps = {
  checked: boolean;
  disabled: boolean;
  type: BooleanToggleType;
  userName: string;
  onChange: (checked: boolean) => void;
};

function BooleanToggle({
  checked,
  disabled,
  type,
  userName,
  onChange,
}: BooleanToggleProps) {
  const t = useTranslations(
    "admin.adminUsersTable"
  );

  const ariaLabel =
    type === "onboarding"
      ? t("toggleAriaLabels.onboarding", {
          user: userName,
        })
      : t(
          "toggleAriaLabels.emailVerification",
          {
            user: userName,
          }
        );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? "bg-[#d8bd8d]"
          : "bg-[#283C5D]/15"
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
  const t = useTranslations(
    "admin.adminUsersTable"
  );

  const [users, setUsers] = useState<
    AdminUser[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers(): Promise<void> {
      try {
        const res = await fetch(
          "/api/admin/users"
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Could not load users."
          );
        }

        setUsers(data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchUsers();
  }, []);

  async function updateUser(
    userId: string,
    field:
      | "emailVerified"
      | "onboardingCompleted",
    value: boolean
  ): Promise<void> {
    const previousUsers = users;

    setUsers(
      (
        currentUsers: AdminUser[]
      ): AdminUser[] =>
        currentUsers.map(
          (
            user: AdminUser
          ): AdminUser =>
            user.id === userId
              ? {
                  ...user,
                  [field]: value,
                }
              : user
        )
    );

    try {
      setUpdatingUserId(userId);

      const res = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            [field]: value,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Could not update user."
        );
      }

      setUsers(
        (
          currentUsers: AdminUser[]
        ): AdminUser[] =>
          currentUsers.map(
            (
              user: AdminUser
            ): AdminUser =>
              user.id === userId
                ? data.user
                : user
          )
      );
    } catch (error) {
      console.error(error);

      setUsers(previousUsers);
    } finally {
      setUpdatingUserId(null);
    }
  }

  function getRoleLabel(
    role: AdminUserRole
  ): string {
    switch (role) {
      case "PATIENT":
        return t("roles.patient");

      case "DOCTOR":
        return t("roles.doctor");

      case "ADMIN":
        return t("roles.admin");
    }
  }

  return (
    <section className="rounded-3xl border border-[#d8bd8d]/30 bg-white p-6 shadow-xl shadow-[#283C5D]/5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d8bd8d]">
            {t("eyebrow")}
          </p>

          <h2 className="mt-3 text-xl font-bold text-[#283C5D]">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm text-[#283C5D]/60">
            {t("description")}
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
              <th className="px-5 py-4 font-bold">
                {t("columns.name")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.email")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.role")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t("columns.onboarding")}
              </th>

              <th className="px-5 py-4 font-bold">
                {t(
                  "columns.emailVerified"
                )}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#283C5D]/10">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#d8bd8d]" />
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[#283C5D]/60"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              users.map(
                (user: AdminUser) => {
                  const isUpdating =
                    updatingUserId === user.id;

                  const userName =
                    user.name ||
                    t("unnamedUser");

                  return (
                    <tr
                      key={user.id}
                      className="bg-white transition hover:bg-[#FAF9F7]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#283C5D]">
                        {userName}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[#283C5D]/65">
                        {user.email}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF2DE] px-3 py-1 text-xs font-bold text-[#283C5D]">
                          <ShieldCheck
                            size={13}
                          />

                          {getRoleLabel(
                            user.role
                          )}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <BooleanToggle
                          checked={
                            user.onboardingCompleted
                          }
                          disabled={isUpdating}
                          type="onboarding"
                          userName={userName}
                          onChange={(
                            checked: boolean
                          ) =>
                            void updateUser(
                              user.id,
                              "onboardingCompleted",
                              checked
                            )
                          }
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <BooleanToggle
                          checked={
                            user.emailVerified
                          }
                          disabled={isUpdating}
                          type="emailVerification"
                          userName={userName}
                          onChange={(
                            checked: boolean
                          ) =>
                            void updateUser(
                              user.id,
                              "emailVerified",
                              checked
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}