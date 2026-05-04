"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import InputField from "../UI/InputField";
import { Lock } from "lucide-react";

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
        <div className="border-t border-gray-300 my-4"></div>
      </div>

      <InputField
        label="Current password"
        type="password"
        placeholder="Enter current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        icon={<Lock size={16} />}
      />

      <InputField
        label="New password"
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={setNewPassword}
        icon={<Lock size={16} />}
      />

      <InputField
        label="Confirm new password"
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        icon={<Lock size={16} />}
      />

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
        from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-sm font-medium text-white 
        transition hover:bg-[#d8bd8d] disabled:opacity-50"
      >
        {isLoading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}