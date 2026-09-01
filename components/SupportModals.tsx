"use client";

import React, { useState } from "react";

import {
  createTicket,
  uploadTicketAttachment,
} from "../lib/api/support";
import { ApiError } from "../lib/api/client";

interface SupportModalsProps {
  modalType: "report" | "support" | null;
  onClose: () => void;
}

const SUPPORT_REASON_LABELS: Record<string, string> = {
  not_working: "Something is not working",
  bug: "Bug or technical issue",
  data: "Data is not uploading",
  stuck: "Listing is stuck",
  listing: "Listing-related issue",
  other_tech: "Other technical problems",
  help_feature: "Need help using a feature",
  guidance: "Need guidance",
  dont_know: "Don't know how to use something",
  assistance: "Need assistance with the platform",
};

const PROBLEM_TYPE_LABELS: Record<string, string> = {
  technical: "Technical Issue",
  account: "Account Issue",
  other: "Other",
};

export default function SupportModals({ modalType, onClose }: SupportModalsProps) {
  // Report state
  const [reportState, setReportState] = useState<"form" | "success">("form");
  const [reportToken, setReportToken] = useState("");
  const [reportProblemType, setReportProblemType] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Support state
  const [supportState, setSupportState] = useState<"form" | "timeslot" | "success">("form");
  const [supportReason, setSupportReason] = useState("");
  const [supportDescription, setSupportDescription] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [supportToken, setSupportToken] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  const timeSlots = [
    "10:00 AM – 10:30 AM",
    "12:00 PM – 12:30 PM",
    "03:00 PM – 03:30 PM",
    "05:00 PM – 05:30 PM",
  ];

  if (!modalType) return null;

  const resetAll = () => {
    setReportState("form");
    setReportProblemType("");
    setReportCategory("");
    setReportDescription("");
    setReportFile(null);
    setReportError(null);

    setSupportState("form");
    setSupportReason("");
    setSupportDescription("");
    setSelectedSlot(null);
    setSupportError(null);
  };

  const handleClose = () => {
    onClose();
    // Reset states after animation/close
    setTimeout(resetAll, 300);
  };

  const submitReport = async () => {
    setReportError(null);

    if (!reportProblemType) {
      setReportError("Please select a problem type.");
      return;
    }

    if (!reportCategory) {
      setReportError("Please select a problem category.");
      return;
    }

    if (reportDescription.trim().length < 10) {
      setReportError("Please describe your problem in at least 10 characters.");
      return;
    }

    setReportSubmitting(true);

    try {
      const ticket = await createTicket({
        complaint_type: "technical",
        category: reportCategory,
        subject: `${PROBLEM_TYPE_LABELS[reportProblemType] || reportProblemType} — ${reportCategory}`,
        description: reportDescription.trim(),
        priority: "medium",
      });

      if (reportFile) {
        try {
          await uploadTicketAttachment(ticket.id, reportFile);
        } catch (uploadErr) {
          console.error("Attachment upload failed:", uploadErr);
        }
      }

      setReportToken(ticket.ticket_number);
      setReportState("success");
    } catch (err) {
      setReportError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong while submitting your report. Please try again."
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  const proceedSupport = () => {
    setSupportError(null);

    if (!supportReason) {
      setSupportError("Please select what you need support for.");
      return;
    }

    if (supportDescription.trim().length < 10) {
      setSupportError("Please describe how we can help in at least 10 characters.");
      return;
    }

    setSupportState("timeslot");
  };

  const submitSupport = async () => {
    if (!selectedSlot) return;

    setSupportError(null);
    setSupportSubmitting(true);

    try {
      const ticket = await createTicket({
        complaint_type: "customer_support",
        category: supportReason,
        subject: SUPPORT_REASON_LABELS[supportReason] || supportReason,
        description: `${supportDescription.trim()}\n\nPreferred call time: ${selectedSlot}`,
        priority: "medium",
      });

      setSupportToken(ticket.ticket_number);
      setSupportState("success");
    } catch (err) {
      setSupportError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong while requesting support. Please try again."
      );
      setSupportState("form");
    } finally {
      setSupportSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
      <div className="relative w-full max-w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {modalType === "report" && (
          <div className="p-8">
            {reportState === "form" ? (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Report a Problem</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-black font-semibold mb-2">Problem Type</label>
                    <div className="relative">
                      <select
                        value={reportProblemType}
                        onChange={(e) => setReportProblemType(e.target.value)}
                        className="w-full bg-[#f4f5f7] border border-gray-200 text-black rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-gray-400"
                      >
                        <option value="">Select type...</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account Issue</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-semibold mb-2">Problem Category</label>
                    <div className="relative">
                      <select
                        value={reportCategory}
                        onChange={(e) => setReportCategory(e.target.value)}
                        className="w-full bg-[#f4f5f7] border border-gray-200 text-black rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-gray-400"
                      >
                        <option value="">Select category...</option>
                        <option value="website">User Interface</option>
                        <option value="bug">Data loading</option>
                        <option value="performance">Performance</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-semibold mb-2">Problem Description</label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="w-full bg-[#f4f5f7] border border-gray-200 text-black rounded-lg px-4 py-3 min-h-[120px] resize-none focus:outline-none focus:border-gray-400"
                      placeholder="Describe your problem..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-black font-semibold mb-2">Problem Picture</label>
                    <label className="flex items-center justify-center gap-2 w-full bg-[#f4f5f7] border border-dashed border-gray-300 text-black rounded-lg px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span className="font-medium">
                        {reportFile ? reportFile.name : "Upload Picture"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  {reportError && (
                    <p className="text-red-600 text-sm font-medium">{reportError}</p>
                  )}

                  <button
                    onClick={submitReport}
                    disabled={reportSubmitting}
                    className="w-full bg-black text-white font-bold py-4 rounded-lg mt-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reportSubmitting ? "Submitting..." : "Report"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Your problem has been reported</h3>
                <p className="text-gray-600 mb-6">Your ticket number is</p>
                <div className="text-3xl font-black text-black mb-8">{reportToken}</div>
                <p className="text-black font-medium mb-8">We will update you shortly.</p>
              </div>
            )}
          </div>
        )}

        {modalType === "support" && (
          <div className="p-8">
            {supportState === "form" && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Get Support</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-black font-semibold mb-2">Support Needed For</label>
                    <div className="relative">
                      <select
                        value={supportReason}
                        onChange={(e) => setSupportReason(e.target.value)}
                        className="w-full bg-[#f4f5f7] border border-gray-200 text-black rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-gray-400"
                      >
                        <option value="">Select reason...</option>
                        <optgroup label="Problems / Issues">
                          <option value="not_working">Something is not working</option>
                          <option value="bug">Bug or technical issue</option>
                          <option value="bug">Data is not uploading</option>
                          <option value="stuck">Listing is stuck</option>
                          <option value="listing">Listing-related issue</option>
                          <option value="other_tech">Other technical problems</option>
                        </optgroup>
                        <optgroup label="General Usage / Assistance">
                          <option value="help_feature">Need help using a feature</option>
                          <option value="guidance">Need guidance</option>
                          <option value="dont_know">Don't know how to use something</option>
                          <option value="assistance">Need assistance with the platform</option>
                        </optgroup>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-semibold mb-2">Description</label>
                    <textarea
                      value={supportDescription}
                      onChange={(e) => setSupportDescription(e.target.value)}
                      className="w-full bg-[#f4f5f7] border border-gray-200 text-black rounded-lg px-4 py-3 min-h-[160px] resize-none focus:outline-none focus:border-gray-400"
                      placeholder="Describe how we can help you..."
                    ></textarea>
                  </div>

                  {supportError && (
                    <p className="text-red-600 text-sm font-medium">{supportError}</p>
                  )}

                  <button
                    onClick={proceedSupport}
                    className="w-full bg-black text-white font-bold py-4 rounded-lg mt-4 hover:bg-gray-800 transition-colors"
                  >
                    Get Support
                  </button>
                </div>
              </>
            )}

            {supportState === "timeslot" && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Select a Time Slot</h2>

                <div className="space-y-3 mb-8">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-center py-4 rounded-xl border-2 transition-all font-semibold ${
                        selectedSlot === slot
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white text-black hover:border-gray-400'
                      }`}
                    >
                      [ {slot} ]
                    </button>
                  ))}
                </div>

                {supportError && (
                  <p className="text-red-600 text-sm font-medium mb-4">{supportError}</p>
                )}

                <button
                  onClick={submitSupport}
                  disabled={!selectedSlot || supportSubmitting}
                  className={`w-full font-bold py-4 rounded-lg transition-colors ${
                    selectedSlot && !supportSubmitting
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {supportSubmitting ? "Submitting..." : "Next"}
                </button>
              </>
            )}

            {supportState === "success" && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">We'll shortly contact you.</h3>
                <p className="text-gray-500 font-medium">Support Ticket: {supportToken}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}