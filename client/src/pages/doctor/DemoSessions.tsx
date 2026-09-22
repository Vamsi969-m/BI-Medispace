import { useEffect, useState } from "react";
import {
  Video,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Plus,
  Loader2,
} from "lucide-react";

import { useApp } from "@/store/AppContext";
import {
  Card,
  StatusBadge,
  PageHeader,
  Tabs,
  EmptyState,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { getMyDemos } from "@/services/demoService";

interface Demo {
  _id: string;

  demoType:
    | "VIDEO"
    | "PHONE"
    | "FACE_TO_FACE";

  scheduledDate: string;

  status:
    | "PENDING"
    | "APPROVED"
    | "DISPATCHED"
    | "LIVE"
    | "COMPLETED"
    | "CANCELLED";

  notes?: string;

  product?: {
    _id: string;
    name: string;
    image?: string;
    purpose?: string;
  };

  representative?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export function DemoSessions() {
  const {
    navigate,
    role,
    token,
    showToast,
  } = useApp();

  const [demos, setDemos] = useState<Demo[]>(
    []
  );

  const [tab, setTab] =
    useState("upcoming");

  const [loading, setLoading] =
    useState(true);

  /*
   * ==========================================
   * LOAD DOCTOR DEMOS
   * ==========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadDemos = async () => {
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

      try {
        if (mounted) {
          setLoading(true);
        }

        const data = await getMyDemos(token);

        if (mounted) {
          setDemos(data.demos || []);
        }
      } catch (error) {
        if (mounted) {
          showToast(
            error instanceof Error
              ? error.message
              : "Failed to load demo sessions",
            "error"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (role === "doctor") {
      void loadDemos();
    } else {
      setLoading(false);
      setDemos([]);
    }

    return () => {
      mounted = false;
    };
  }, [role, token, showToast]);

  /*
   * ==========================================
   * FILTER DEMOS
   * ==========================================
   */

  const upcoming = demos.filter((demo) =>
    [
      "PENDING",
      "APPROVED",
      "DISPATCHED",
      "LIVE",
    ].includes(demo.status)
  );

  const completed = demos.filter(
    (demo) =>
      demo.status === "COMPLETED"
  );

  const cancelled = demos.filter(
    (demo) =>
      demo.status === "CANCELLED"
  );

  /*
   * ==========================================
   * TABS
   * ==========================================
   */

  const tabData = [
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcoming.length,
    },
    {
      id: "completed",
      label: "Completed",
      count: completed.length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: cancelled.length,
    },
  ];

  const currentList =
    tab === "upcoming"
      ? upcoming
      : tab === "completed"
      ? completed
      : cancelled;

  /*
   * ==========================================
   * SESSION ICON
   * ==========================================
   */

  const getSessionIcon = (
    demoType: Demo["demoType"]
  ) => {
    switch (demoType) {
      case "VIDEO":
        return Video;

      case "PHONE":
        return Phone;

      case "FACE_TO_FACE":
        return MapPin;

      default:
        return Video;
    }
  };

  /*
   * ==========================================
   * SESSION NAME
   * ==========================================
   */

  const getSessionType = (
    demoType: Demo["demoType"]
  ) => {
    switch (demoType) {
      case "VIDEO":
        return "Video Call";

      case "PHONE":
        return "Phone Call";

      case "FACE_TO_FACE":
        return "Face-to-Face Meeting";

      default:
        return "Demo Session";
    }
  };

  /*
   * ==========================================
   * OPEN DEMO
   * ==========================================
   */

  const handleOpenDemo = (
    demoId: string
  ) => {
    navigate("demo-session", {
      id: demoId,
    });
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div>
      <PageHeader
        title="Demo Sessions"
        subtitle="Manage your product demonstration sessions"
        action={
          role === "doctor" ? (
            <button
              type="button"
              onClick={() =>
                navigate("products")
              }
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Book Demo
            </button>
          ) : undefined
        }
      />

      {/* =====================================
          LOADING
      ===================================== */}

      {loading ? (
        <Card className="p-10">
          <div className="flex items-center justify-center gap-3 text-ink-500">
            <Loader2 className="w-5 h-5 animate-spin" />

            <p className="text-sm">
              Loading demo sessions...
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-5 mb-5">
          {/* =================================
              TABS
          ================================= */}

          <Tabs
            tabs={tabData}
            active={tab}
            onChange={setTab}
          />

          <div className="pt-4">
            {/* =================================
                EMPTY STATE
            ================================= */}

            {currentList.length === 0 ? (
              <EmptyState
                icon={Video}
                title={`No ${tab} sessions`}
                description={
                  tab === "upcoming"
                    ? "Book a demo to see a product in action with a BI representative."
                    : `No ${tab} demo sessions yet.`
                }
                action={
                  tab === "upcoming" &&
                  role === "doctor" ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() =>
                        navigate("products")
                      }
                    >
                      Browse Products
                    </button>
                  ) : undefined
                }
              />
            ) : (
              /* =================================
                 DEMO LIST
              ================================= */

              <div className="space-y-3">
                {currentList.map((demo) => {
                  const Icon =
                    getSessionIcon(
                      demo.demoType
                    );

                  const sessionType =
                    getSessionType(
                      demo.demoType
                    );

                  const scheduledDate =
                    new Date(
                      demo.scheduledDate
                    );

                  const validDate =
                    !Number.isNaN(
                      scheduledDate.getTime()
                    );

                  const formattedTime =
                    validDate
                      ? scheduledDate.toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )
                      : "Time unavailable";

                  return (
                    <button
                      key={demo._id}
                      type="button"
                      onClick={() =>
                        handleOpenDemo(
                          demo._id
                        )
                      }
                      className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-ink-100 hover:border-ink-200 hover:shadow-soft transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-300"
                    >
                      {/* =========================
                          LEFT CONTENT
                      ========================= */}

                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-brand-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-ink-900 truncate">
                            {demo.product?.name ||
                              "Product"}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {/* Date */}
                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />

                              {validDate
                                ? formatDate(
                                    demo.scheduledDate
                                  )
                                : "Date unavailable"}
                            </span>

                            {/* Time */}
                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />

                              {formattedTime}
                            </span>

                            {/* Representative */}
                            <span className="text-xs text-ink-500 flex items-center gap-1">
                              <User className="w-3 h-3" />

                              <span className="max-w-[220px] truncate">
                                {demo
                                  .representative
                                  ?.fullName ||
                                  "Representative not assigned"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* =========================
                          RIGHT CONTENT
                      ========================= */}

                      <div className="flex items-center gap-3 ml-16 sm:ml-0 flex-wrap">
                        <span className="badge bg-ink-50 text-ink-600">
                          {sessionType}
                        </span>

                        <StatusBadge
                          status={demo.status}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}