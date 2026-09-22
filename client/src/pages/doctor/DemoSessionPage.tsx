import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowLeft,
  Video,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle2,
  FileText,
  Info,
  ShieldCheck,
  Send,
  FlaskConical,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import { useApp } from "@/store/AppContext";
import { getDemoById } from "@/services/demoService";
import {
  Card,
  StatusBadge,
  PageHeader,
  EmptyState,
  Tabs,
} from "@/components/ui";
import { formatDate, formatDateLong, cn } from "@/lib/utils";

interface DemoDetails {
  _id?: string;

  product: {
    _id: string;
    name: string;
    image?: string;
    purpose: string;
    uses: string[];
    category?: string;
    description?: string;
  };

  demoType: "VIDEO" | "PHONE" | "FACE_TO_FACE";

  status:
    | "PENDING"
    | "APPROVED"
    | "DISPATCHED"
    | "LIVE"
    | "COMPLETED"
    | "CANCELLED"
    | string;

  scheduledDate: string;

  notes?: string;

  representative?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };

  meeting?: {
    platform?: string;
    meetingLink?: string;
    meetingId?: string;
    password?: string;
    startTime?: string;
    endTime?: string;
  };

  feedback?: {
    rating: number;
    comment: string;
  };
}

export function DemoSessionPage() {
  const {
    token,
    navigate,
    showToast,
    pageParams,
  } = useApp();

  const [demo, setDemo] =
    useState<DemoDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("session");

  const [notes, setNotes] =
    useState("");

  const [feedbackRating, setFeedbackRating] =
    useState(0);

  const [feedbackComment, setFeedbackComment] =
    useState("");

  /*
   * -----------------------------------------
   * LOAD DEMO
   * -----------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadDemo = async () => {
      if (!token) {
        if (mounted) {
          setLoading(false);
          showToast(
            "Please login again",
            "error"
          );
        }
        return;
      }

      if (!pageParams.id) {
        if (mounted) {
          setLoading(false);
          showToast(
            "Demo session not found",
            "error"
          );
        }
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
        }

        const data = await getDemoById(
          token,
          pageParams.id
        );

        if (mounted) {
          setDemo(data.demo);
        }
      } catch (error) {
        if (mounted) {
          showToast(
            error instanceof Error
              ? error.message
              : "Failed to load demo session",
            "error"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadDemo();

    return () => {
      mounted = false;
    };
  }, [pageParams.id, token, showToast]);

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
      <Card className="p-10">
        <div className="flex items-center justify-center gap-3 text-ink-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">
            Loading demo session...
          </span>
        </div>
      </Card>
    );
  }

  /*
   * -----------------------------------------
   * DEMO NOT FOUND
   * -----------------------------------------
   */

  if (!demo || !demo.product) {
    return (
      <Card>
        <EmptyState
          icon={Video}
          title="Demo session not found"
          description="The session you're looking for doesn't exist or has been removed."
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                navigate("demos")
              }
            >
              Back to Demo Sessions
            </button>
          }
        />
      </Card>
    );
  }

  const product = demo.product;

  /*
   * -----------------------------------------
   * SESSION TYPE
   * -----------------------------------------
   */

  const SessionIcon: ComponentType<{
    className?: string;
  }> =
    demo.demoType === "VIDEO"
      ? Video
      : demo.demoType === "PHONE"
      ? Phone
      : MapPin;

  const sessionType =
    demo.demoType === "VIDEO"
      ? "Video Call"
      : demo.demoType === "PHONE"
      ? "Phone Call"
      : "Face-to-Face Meeting";

  /*
   * -----------------------------------------
   * DATE / TIME
   * -----------------------------------------
   */

  const scheduledDate = new Date(
    demo.scheduledDate
  );

  const validScheduledDate =
    !Number.isNaN(
      scheduledDate.getTime()
    );

  const formattedTime =
    validScheduledDate
      ? scheduledDate.toLocaleTimeString(
          "en-IN",
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "Time unavailable";

  /*
   * -----------------------------------------
   * TABS
   * -----------------------------------------
   */

  const tabs = [
    {
      id: "session",
      label: "Session",
    },
    {
      id: "product",
      label: "Product Info",
    },
    {
      id: "notes",
      label: "My Notes",
    },
    {
      id: "feedback",
      label: "Feedback",
    },
  ];

  /*
   * -----------------------------------------
   * FEEDBACK
   * -----------------------------------------
   */

  const handleSubmitFeedback = () => {
    if (!feedbackRating) {
      showToast(
        "Please select a rating",
        "error"
      );
      return;
    }

    /*
     * Backend endpoint for feedback has not
     * been implemented yet.
     */
    showToast(
      "Feedback feature will be connected to the backend next.",
      "info"
    );
  };

  /*
   * -----------------------------------------
   * SAVE NOTES
   * -----------------------------------------
   */

  const handleSaveNotes = () => {
    if (!notes.trim()) {
      showToast(
        "Please enter some notes before saving.",
        "error"
      );
      return;
    }

    /*
     * Notes API is not implemented yet.
     */
    showToast(
      "Notes are currently saved only for this session.",
      "info"
    );
  };

  /*
   * -----------------------------------------
   * JOIN SESSION
   * -----------------------------------------
   */

  const canJoinSession =
    Boolean(demo.meeting?.meetingLink) &&
    ["DISPATCHED", "LIVE"].includes(
      demo.status
    );

  return (
    <div>
      {/* =====================================
          BACK BUTTON
      ===================================== */}

      <button
        type="button"
        onClick={() =>
          navigate("demos")
        }
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Demo Sessions
      </button>

      {/* =====================================
          HEADER
      ===================================== */}

      <PageHeader
        title={product.name}
        subtitle={`Demo session with ${
          demo.representative?.fullName ||
          "Representative not assigned"
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <div className="lg:col-span-2 space-y-5">
          {/* ===================================
              DEMO SUMMARY
          =================================== */}

          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                  <SessionIcon className="w-6 h-6 text-brand-600" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">
                    {sessionType}
                  </p>

                  <p className="text-sm text-ink-500">
                    {validScheduledDate
                      ? formatDateLong(
                          demo.scheduledDate
                        )
                      : "Date unavailable"}
                  </p>
                </div>
              </div>

              <StatusBadge
                status={demo.status}
              />
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-ink-100">
              {/* Date */}
              <div>
                <p className="text-xs text-ink-400">
                  Date
                </p>

                <p className="text-sm font-medium text-ink-700 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />

                  {validScheduledDate
                    ? formatDate(
                        demo.scheduledDate
                      )
                    : "Unavailable"}
                </p>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs text-ink-400">
                  Time
                </p>

                <p className="text-sm font-medium text-ink-700 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formattedTime}
                </p>
              </div>

              {/* Representative */}
              <div>
                <p className="text-xs text-ink-400">
                  Representative
                </p>

                <p className="text-sm font-medium text-ink-700 flex items-center gap-1.5 mt-1 truncate">
                  <User className="w-3.5 h-3.5 shrink-0" />

                  <span className="truncate">
                    {demo.representative
                      ?.fullName ||
                      "Not assigned"}
                  </span>
                </p>
              </div>
            </div>

            {/* Doctor Notes */}
            {demo.notes?.trim() && (
              <div className="mt-4 p-3 rounded-lg bg-ink-50 text-sm text-ink-600">
                <p className="text-xs font-semibold text-ink-500 mb-1">
                  Session Notes
                </p>

                <p className="whitespace-pre-wrap">
                  {demo.notes}
                </p>
              </div>
            )}

            {/* =================================
                JOIN SESSION
            ================================= */}

            {canJoinSession && (
              <>
                <a
                  href={demo.meeting!.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Join Session
                </a>

                <div className="mt-4 p-4 rounded-lg bg-brand-50 border border-brand-100">
                  <p className="text-sm font-semibold text-ink-900">
                    Meeting Details
                  </p>

                  <div className="mt-2 space-y-1.5">
                    {demo.meeting?.platform && (
                      <p className="text-xs text-ink-600">
                        Platform:{" "}
                        {demo.meeting.platform}
                      </p>
                    )}

                    {demo.meeting?.meetingId && (
                      <p className="text-xs text-ink-600">
                        Meeting ID:{" "}
                        {demo.meeting.meetingId}
                      </p>
                    )}

                    {demo.meeting?.startTime && (
                      <p className="text-xs text-ink-600">
                        Start:{" "}
                        {formatDateTime(
                          demo.meeting.startTime
                        )}
                      </p>
                    )}

                    {demo.meeting?.endTime && (
                      <p className="text-xs text-ink-600">
                        End:{" "}
                        {formatDateTime(
                          demo.meeting.endTime
                        )}
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-ink-500 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    Meeting credentials are provided only to authorized participants.
                  </p>
                </div>
              </>
            )}

            {/* Pending information */}
            {demo.status === "PENDING" && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-sm font-medium text-amber-800">
                  Waiting for approval
                </p>

                <p className="text-xs text-amber-700 mt-1">
                  A BI representative needs to review and approve this demo request.
                </p>
              </div>
            )}

            {/* Approved but meeting not ready */}
            {demo.status === "APPROVED" &&
              !demo.meeting?.meetingLink && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">
                    Demo approved
                  </p>

                  <p className="text-xs text-blue-700 mt-1">
                    Meeting details will become available once the representative dispatches the session.
                  </p>
                </div>
              )}

            {/* Cancelled */}
            {demo.status ===
              "CANCELLED" && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm font-medium text-red-800">
                  Demo Cancelled
                </p>

                <p className="text-xs text-red-700 mt-1">
                  This demo session has been cancelled.
                </p>
              </div>
            )}
          </Card>

          {/* ===================================
              TABS
          =================================== */}

          <Card className="p-5">
            <Tabs
              tabs={tabs}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className="pt-5">
              {/* =================================
                  SESSION TAB
              ================================= */}

              {activeTab === "session" && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl bg-ink-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900/50 to-ink-950" />

                    <div className="relative text-center px-4">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3">
                        <SessionIcon className="w-10 h-10 text-white" />
                      </div>

                      <p className="text-white font-medium">
                        {demo.status ===
                        "COMPLETED"
                          ? "Session Completed"
                          : demo.status ===
                            "LIVE"
                          ? "Session is Live"
                          : demo.status ===
                            "CANCELLED"
                          ? "Session Cancelled"
                          : "Session Ready"}
                      </p>

                      <p className="text-white/60 text-sm mt-1">
                        {sessionType} •{" "}
                        {formattedTime}
                      </p>
                    </div>
                  </div>

                  {/* Completed Feedback */}
                  {demo.status ===
                    "COMPLETED" &&
                    demo.feedback && (
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />

                          <p className="font-medium text-green-900">
                            Session Completed
                          </p>
                        </div>

                        <StarRating
                          rating={
                            demo.feedback
                              .rating
                          }
                        />

                        <p className="text-sm text-green-800 mt-2">
                          {
                            demo.feedback
                              .comment
                          }
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* =================================
                  PRODUCT TAB
              ================================= */}

              {activeTab === "product" && (
                <div className="space-y-5">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-ink-100 flex items-center justify-center">
                      <FlaskConical className="w-10 h-10 text-ink-300" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-ink-900 mb-1 flex items-center gap-2">
                      <Info className="w-4 h-4 text-brand-600" />
                      Purpose
                    </h3>

                    <p className="text-sm text-ink-600 leading-6">
                      {product.purpose ||
                        "Purpose information is not available."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-ink-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Approved Uses
                    </h3>

                    {product.uses?.length ? (
                      <ul className="space-y-2">
                        {product.uses.map(
                          (use, index) => (
                            <li
                              key={`${use}-${index}`}
                              className="flex items-start gap-2 text-sm text-ink-600"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />

                              <span>{use}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink-500">
                        No approved uses have been provided.
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-ink-500 p-3 rounded-lg bg-ink-50">
                    <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />

                    <span>
                      Medical and product information shown here is based on BI-approved product content.
                    </span>
                  </div>
                </div>
              )}

              {/* =================================
                  NOTES TAB
              ================================= */}

              {activeTab === "notes" && (
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="session-notes"
                      className="label"
                    >
                      Session Notes
                    </label>

                    <textarea
                      id="session-notes"
                      value={notes}
                      onChange={(event) =>
                        setNotes(
                          event.target.value
                        )
                      }
                      rows={6}
                      maxLength={2000}
                      placeholder="Take notes during the session..."
                      className="input resize-none"
                    />

                    <p className="text-xs text-ink-400 text-right mt-1">
                      {notes.length}/2000
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={!notes.trim()}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-4 h-4" />
                    Save Notes
                  </button>

                  <p className="text-xs text-ink-400">
                    Notes backend storage will be connected in a later step.
                  </p>
                </div>
              )}

              {/* =================================
                  FEEDBACK TAB
              ================================= */}

              {activeTab ===
                "feedback" && (
                <div className="space-y-5">
                  {demo.feedback ? (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="font-medium text-green-900 mb-2">
                        Feedback Submitted
                      </p>

                      <StarRating
                        rating={
                          demo.feedback
                            .rating
                        }
                      />

                      <p className="text-sm text-green-800 mt-2">
                        {
                          demo.feedback
                            .comment
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="label">
                          Rate the session
                        </label>

                        <div
                          className="flex gap-2"
                          role="radiogroup"
                          aria-label="Session rating"
                        >
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setFeedbackRating(
                                    star
                                  )
                                }
                                className="rounded-md p-1 hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
                                aria-label={`Rate ${star} out of 5`}
                                aria-pressed={
                                  feedbackRating ===
                                  star
                                }
                              >
                                <Star
                                  className={cn(
                                    "w-8 h-8 transition-colors",
                                    star <=
                                      feedbackRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-ink-200 hover:text-ink-300"
                                  )}
                                />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="feedback-comment"
                          className="label"
                        >
                          Your feedback
                        </label>

                        <textarea
                          id="feedback-comment"
                          value={
                            feedbackComment
                          }
                          onChange={(event) =>
                            setFeedbackComment(
                              event.target
                                .value
                            )
                          }
                          rows={4}
                          maxLength={1000}
                          placeholder="Share your thoughts about the demo session..."
                          className="input resize-none"
                        />

                        <p className="text-xs text-ink-400 text-right mt-1">
                          {
                            feedbackComment.length
                          }
                          /1000
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleSubmitFeedback
                        }
                        disabled={
                          !feedbackRating
                        }
                        className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </button>

                      <p className="text-xs text-ink-400">
                        Feedback API will be connected to the backend in a later step.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* =====================================
            RIGHT SIDEBAR
        ===================================== */}

        <div className="space-y-4">
          {/* Representative */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              Representative
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-brand-600" />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-ink-900 truncate">
                  {demo.representative
                    ?.fullName ||
                    "Representative not assigned"}
                </p>

                <p className="text-xs text-ink-500">
                  BI Healthcare Representative
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-ink-100 space-y-2">
              {demo.representative
                ?.email && (
                <p className="text-xs text-ink-500 flex items-start gap-2 break-all">
                  <User className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {demo.representative.email}
                </p>
              )}

              {demo.representative
                ?.phone && (
                <p className="text-xs text-ink-500 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {demo.representative.phone}
                </p>
              )}

              {!demo.representative
                ?.email &&
                !demo.representative
                  ?.phone && (
                  <p className="text-xs text-ink-500">
                    Representative contact details are not available.
                  </p>
                )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "sample-request",
                    {
                      productId:
                        product._id,
                    }
                  )
                }
                className="w-full btn-secondary text-sm inline-flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Request Sample
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "order-product",
                    {
                      productId:
                        product._id,
                    }
                  )
                }
                className="w-full btn-secondary text-sm inline-flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Order Product
              </button>
            </div>
          </Card>

          {/* Session Information */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              Session Information
            </h3>

            <div className="space-y-3 text-sm">
              <InfoRow
                label="Type"
                value={sessionType}
              />

              <InfoRow
                label="Status"
                value={formatStatus(
                  demo.status
                )}
              />

              <InfoRow
                label="Scheduled"
                value={
                  validScheduledDate
                    ? formatDate(
                        demo.scheduledDate
                      )
                    : "Unavailable"
                }
              />

              <InfoRow
                label="Time"
                value={formattedTime}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/*
 * ===========================================
 * STAR RATING
 * ===========================================
 */

function StarRating({
  rating,
}: {
  rating: number;
}) {
  const safeRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= safeRating
                ? "fill-amber-400 text-amber-400"
                : "text-ink-200"
            )}
          />
        )
      )}

      <span className="ml-1 text-xs text-ink-500">
        {safeRating}/5
      </span>
    </div>
  );
}

/*
 * ===========================================
 * INFO ROW
 * ===========================================
 */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-ink-500">
        {label}
      </span>

      <span className="font-medium text-ink-800 text-right">
        {value}
      </span>
    </div>
  );
}

/*
 * ===========================================
 * FORMAT DATE + TIME
 * ===========================================
 */

function formatDateTime(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/*
 * ===========================================
 * FORMAT STATUS
 * ===========================================
 */

function formatStatus(
  status: string
): string {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}