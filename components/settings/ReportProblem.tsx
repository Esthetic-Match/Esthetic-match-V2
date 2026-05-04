"use client";

import { useState } from "react";
import InputField from "../UI/InputField";
import { MessageSquare } from "lucide-react";
import TextareaField from "@/components/UI/textareaField";

export default function ReportProblem() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/report-problem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      });

      if (!res.ok) throw new Error("Failed");

      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-full max-w-xl flex-col justify-center space-y-5"
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
          Feedback
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">
          Report A Problem
        </h2>
        <div className="border-t border-gray-300 my-4"></div>
      </div>

      {/* SUBJECT */}
      <InputField
        label="Subject"
        placeholder="Enter subject..."
        value={subject}
        onChange={setSubject}
        icon={<MessageSquare size={16} />}
      />

      {/* MESSAGE (keep textarea) */}
      <TextareaField
        label="Message"
        placeholder="Describe your issue..."
        value={message}
        onChange={setMessage}
        icon={<MessageSquare size={16} />}
      />

      {/* SUCCESS */}
      {success && (
        <p className="text-green-600 text-sm">
          Message sent successfully.
        </p>
      )}

      {/* BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r 
        from-[#d8bd8d] to-[#f2dbb1] px-4 py-3 text-white text-sm font-medium 
        transition hover:scale-[1.02] disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}