"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setErrorMessage(error.message || "Failed to change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password changed successfully.");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleChangePassword}
      className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5"
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Security
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Change Password
        </h2>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
          placeholder="Enter current password"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
          placeholder="Enter new password"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
          placeholder="Confirm new password"
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-green-600">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-gradient-to-r 
              from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#d8bd8d] disabled:opacity-50"
      >
        {isLoading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}