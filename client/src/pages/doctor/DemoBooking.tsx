import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Video,
  Phone,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useApp } from "@/store/AppContext";
import { Card, PageHeader } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";
import { bookDemo } from "@/services/demoService";

type DemoType = "VIDEO" | "PHONE" | "FACE_TO_FACE";

export function DemoBooking() {
  const {
    user,
    token,
    products,
    pageParams,
    navigate,
    showToast,
  } = useApp();

  /*
   * -----------------------------------------
   * PRODUCT
   * -----------------------------------------
   */

  const product = useMemo(() => {
    if (!pageParams.productId) {
      return null;
    }

    return products.find(
      (item) => item.id === pageParams.productId
    );
  }, [products, pageParams.productId]);

  /*
   * -----------------------------------------
   * STATE
   * -----------------------------------------
   */

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedTime, setSelectedTime] =
    useState("");

  const [demoType, setDemoType] =
    useState<DemoType>("VIDEO");

  const [notes, setNotes] =
    useState("");

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  /*
   * -----------------------------------------
   * TIME SLOTS
   * -----------------------------------------
   */

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  /*
   * -----------------------------------------
   * SESSION TYPES
   * -----------------------------------------
   */

  const sessionTypes: {
    type: DemoType;
    label: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
    desc: string;
  }[] = [
    {
      type: "VIDEO",
      label: "Video Call",
      icon: Video,
      desc: "Online video conference",
    },
    {
      type: "PHONE",
      label: "Phone Call",
      icon: Phone,
      desc: "Audio phone call",
    },
    {
      type: "FACE_TO_FACE",
      label: "Face-to-Face Meeting",
      icon: MapPin,
      desc: "In-person at your location",
    },
  ];

  /*
   * -----------------------------------------
   * MINIMUM DATE
   * -----------------------------------------
   */

  const today = new Date();
  const minimumDate =
    today.toISOString().split("T")[0];

  /*
   * -----------------------------------------
   * DATE + TIME
   * -----------------------------------------
   */

  const getScheduledDateTime = () => {
    const timeMap: Record<string, string> = {
      "9:00 AM": "09:00",
      "10:00 AM": "10:00",
      "11:00 AM": "11:00",
      "1:00 PM": "13:00",
      "2:00 PM": "14:00",
      "3:00 PM": "15:00",
      "4:00 PM": "16:00",
    };

    const selected24HourTime =
      timeMap[selectedTime];

    if (!selectedDate || !selected24HourTime) {
      return "";
    }

    return `${selectedDate}T${selected24HourTime}:00`;
  };

  /*
   * -----------------------------------------
   * OPEN CONFIRMATION
   * -----------------------------------------
   */

  const handleOpenConfirmation = () => {
    if (!user) {
      showToast(
        "Please login first",
        "error"
      );
      return;
    }

    if (!token) {
      showToast(
        "Authentication token not found. Please login again.",
        "error"
      );
      return;
    }

    if (!pageParams.productId) {
      showToast(
        "Product not selected",
        "error"
      );
      return;
    }

    if (!selectedDate) {
      showToast(
        "Please select a date",
        "error"
      );
      return;
    }

    if (!selectedTime) {
      showToast(
        "Please select a time slot",
        "error"
      );
      return;
    }

    setConfirmOpen(true);
  };

  /*
   * -----------------------------------------
   * BOOK DEMO
   * -----------------------------------------
   */

  const handleConfirm = async () => {
    if (!user) {
      showToast(
        "Please login first",
        "error"
      );
      return;
    }

    if (!token) {
      showToast(
        "Authentication token not found. Please login again.",
        "error"
      );
      return;
    }

    if (!pageParams.productId) {
      showToast(
        "Product not selected",
        "error"
      );
      return;
    }

    const scheduledDate =
      getScheduledDateTime();

    if (!scheduledDate) {
      showToast(
        "Please select a valid date and time",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      await bookDemo(token, {
        product: pageParams.productId,
        demoType,
        scheduledDate,
        notes: notes.trim(),
      });

      setConfirmOpen(false);

      showToast(
        "Demo booked successfully. Waiting for approval.",
        "success"
      );

      navigate("demos");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to book demo",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * -----------------------------------------
   * PRODUCT NOT FOUND
   * -----------------------------------------
   */

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
          <PackageFallback />
        </div>

        <h2 className="text-lg font-semibold text-ink-800">
          Product not found
        </h2>

        <p className="mt-1 text-sm text-ink-500">
          The selected product could not be found.
        </p>

        <button
          type="button"
          onClick={() => navigate("products")}
          className="btn-primary mt-5"
        >
          Back to Products
        </button>
      </div>
    );
  }

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div>
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("products")}
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      {/* Header */}
      <PageHeader
        title="Book a Demo Session"
        subtitle={`Product: ${product.name}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <div className="lg:col-span-2 space-y-5">
          {/* Session Type */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-4">
              Session Type
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sessionTypes.map(
                ({
                  type,
                  label,
                  icon: Icon,
                  desc,
                }) => {
                  const selected =
                    demoType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setDemoType(type)
                      }
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        selected
                          ? "border-brand-500 bg-brand-50"
                          : "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6 mb-2",
                          selected
                            ? "text-brand-600"
                            : "text-ink-400"
                        )}
                      />

                      <p className="text-sm font-medium text-ink-800">
                        {label}
                      </p>

                      <p className="text-xs text-ink-500 mt-0.5">
                        {desc}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Select Date & Time
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date */}
              <div>
                <label
                  htmlFor="demo-date"
                  className="label"
                >
                  Date
                </label>

                <input
                  id="demo-date"
                  type="date"
                  value={selectedDate}
                  min={minimumDate}
                  onChange={(event) =>
                    setSelectedDate(
                      event.target.value
                    )
                  }
                  className="input"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <p className="label">
                  Time Slot
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => {
                    const selected =
                      selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          setSelectedTime(slot)
                        }
                        className={cn(
                          "px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                          selected
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50"
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-5">
            <label
              htmlFor="demo-notes"
              className="label"
            >
              Notes for the Representative
              <span className="text-ink-400 font-normal">
                {" "}
                (Optional)
              </span>
            </label>

            <textarea
              id="demo-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={4}
              maxLength={1000}
              placeholder="Add any specific topics or questions you'd like the representative to address..."
              className="input resize-none"
            />

            <p className="text-xs text-ink-400 mt-1 text-right">
              {notes.length}/1000
            </p>
          </Card>

          {/* Confirm */}
          <button
            type="button"
            onClick={handleOpenConfirmation}
            disabled={
              !selectedDate ||
              !selectedTime ||
              submitting
            }
            className="w-full btn-primary py-3 inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            Confirm Booking
          </button>
        </div>

        {/* =====================================
            SIDEBAR
        ===================================== */}

        <div className="space-y-4">
          {/* Doctor Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              Your Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-brand-600" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate">
                  {user?.fullName ||
                    "Doctor"}
                </p>

                <p className="text-xs text-ink-500 truncate">
                  {user?.specialization ||
                    "Doctor"}
                </p>

                <p className="text-xs text-ink-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </Card>

          {/* Product */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              Product Summary
            </h3>

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 rounded-xl object-cover mb-3"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div className="w-full h-32 rounded-xl bg-ink-100 flex items-center justify-center mb-3">
                <PackageFallback />
              </div>
            )}

            <p className="font-medium text-ink-900">
              {product.name}
            </p>

            <p className="text-xs text-ink-500 mt-1">
              {product.category}
            </p>

            {product.shortDescription && (
              <p className="text-sm text-ink-600 mt-2">
                {product.shortDescription}
              </p>
            )}
          </Card>

          {/* Next Steps */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              What happens next?
            </h3>

            <div className="space-y-4">
              <Step
                number="1"
                text="Submit your demo request."
              />

              <Step
                number="2"
                text="A BI representative reviews your request."
              />

              <Step
                number="3"
                text="Once approved, meeting details become available."
              />
            </div>
          </Card>
        </div>
      </div>

      {/* =====================================
          CONFIRMATION MODAL
      ===================================== */}

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!submitting) {
            setConfirmOpen(false);
          }
        }}
        title="Confirm Demo Booking"
        subtitle="Review your demo request before submitting."
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={submitting}
              onClick={() =>
                setConfirmOpen(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2"
              disabled={submitting}
              onClick={() =>
                void handleConfirm()
              }
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}

              {submitting
                ? "Booking..."
                : "Confirm Booking"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Product */}
          <div className="p-3 rounded-lg bg-ink-50">
            <p className="text-sm font-medium text-ink-900">
              {product.name}
            </p>

            <p className="text-xs text-ink-500 mt-1">
              Your request will be submitted for BI representative approval.
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <SummaryRow
              label="Session Type"
              value={
                sessionTypes.find(
                  (item) =>
                    item.type === demoType
                )?.label || "Video Call"
              }
            />

            <SummaryRow
              label="Date"
              value={formatSelectedDate(
                selectedDate
              )}
            />

            <SummaryRow
              label="Time"
              value={selectedTime}
            />

            <SummaryRow
              label="Status"
              value="Pending Approval"
              valueClassName="text-amber-600"
            />
          </div>

          {/* Notes */}
          {notes.trim() && (
            <div>
              <p className="text-xs font-medium text-ink-500 mb-1">
                Notes
              </p>

              <p className="text-sm text-ink-700 rounded-lg bg-ink-50 p-3">
                {notes.trim()}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/*
 * -----------------------------------------
 * STEP COMPONENT
 * -----------------------------------------
 */

function Step({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-brand-600">
          {number}
        </span>
      </div>

      <p className="text-sm text-ink-600 pt-1">
        {text}
      </p>
    </div>
  );
}

/*
 * -----------------------------------------
 * SUMMARY ROW
 * -----------------------------------------
 */

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-ink-500">
        {label}
      </span>

      <span
        className={cn(
          "font-medium text-ink-800 text-right",
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  );
}

/*
 * -----------------------------------------
 * DATE FORMATTER
 * -----------------------------------------
 */

function formatSelectedDate(
  dateString: string
): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/*
 * -----------------------------------------
 * SIMPLE PACKAGE FALLBACK
 * -----------------------------------------
 */

function PackageFallback() {
  return (
    <div className="w-10 h-10 rounded-xl bg-ink-200 flex items-center justify-center">
      <span className="text-ink-400 text-lg">
        📦
      </span>
    </div>
  );
}