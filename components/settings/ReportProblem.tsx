"use client";

import { useState } from "react";

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
      className="max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center h-full gap-4"
    >
      <h2 className="text-2xl font-semibold text-[#283C5D]">
        Report a Problem
      </h2>

      {/* SUBJECT */}
      <div className="space-y-2 w-full">
        <label className="text-sm font-medium">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject..."
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
        />
      </div>

      {/* MESSAGE */}
      <div className="space-y-2 w-full">
        <label className="text-sm font-medium">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          rows={6}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#283C5D]"
        />
      </div>

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
        className="w-full rounded-xl bg-[#283C5D] px-4 py-3 text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}