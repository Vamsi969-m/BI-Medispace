import { useEffect, useState } from "react";
import { useApp } from "@/store/AppContext";
import {
  getAllDemos,
  approveDemo,
  addMeetingDetails,
  updateDemoStatus
} from "@/services/demoService";

interface Demo {
  _id: string;
  demoType: "VIDEO" | "PHONE" | "FACE_TO_FACE";
  scheduledDate: string;
  status: string;
  notes?: string;

  doctor?: {
    fullName: string;
    email: string;
    phone: string;
    specialization: string;
  };

  product?: {
    name: string;
    category: string;
    shortDescription: string;
    image: string;
    price: number;
  };

  representative?: {
    fullName: string;
  };
}

type MeetingPlatform =
  | "ZOOM"
  | "GOOGLE_MEET"
  | "MICROSOFT_TEAMS"
  | "WEBEX"
  | "OTHER";

const RepDemoManagement = () => {
  const { showToast } = useApp();

  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);

  const [meetingDemoId, setMeetingDemoId] = useState<string | null>(null);

  const [meetingForm, setMeetingForm] = useState<{
    platform: MeetingPlatform;
    meetingLink: string;
    meetingId: string;
    password: string;
    startTime: string;
    endTime: string;
  }>({
    platform: "ZOOM",
    meetingLink: "",
    meetingId: "",
    password: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    loadDemos();
  }, []);

  const loadDemos = async () => {
    try {
      const token = localStorage.getItem("bi_token");

      if (!token) {
        showToast("Please login again", "error");
        return;
      }

      const data = await getAllDemos(token);

      setDemos(data.demos || []);
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : "Failed to load demos",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDemo = async (demoId: string) => {
    try {
      const token = localStorage.getItem("bi_token");

      if (!token) {
        showToast("Please login again", "error");
        return;
      }

      await approveDemo(token, demoId);

      showToast(
        "Demo approved successfully",
        "success"
      );

      await loadDemos();
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : "Failed to approve demo",
        "error"
      );
    }
  };

  const handleAddMeetingDetails = async (demoId: string) => {
    try {
      const token = localStorage.getItem("bi_token");

      if (!token) {
        showToast("Please login again", "error");
        return;
      }

      if (
        !meetingForm.meetingLink ||
        !meetingForm.startTime ||
        !meetingForm.endTime
      ) {
        showToast(
          "Meeting link, start time and end time are required",
          "error"
        );
        return;
      }

      if (
        new Date(meetingForm.endTime) <=
        new Date(meetingForm.startTime)
      ) {
        showToast(
          "End time must be after start time",
          "error"
        );
        return;
      }

      await addMeetingDetails(
        token,
        demoId,
        {
          ...meetingForm,
          startTime: new Date(
            meetingForm.startTime
          ).toISOString(),
          endTime: new Date(
            meetingForm.endTime
          ).toISOString(),
        }
      );

      showToast(
        "Meeting details added successfully",
        "success"
      );

      setMeetingDemoId(null);

      resetMeetingForm();

      await loadDemos();
    } catch (error: unknown) {
      showToast(
        error instanceof Error ? error.message : "Failed to add meeting details",
        "error"
      );
    }
  };

  const handleMarkLive = async (demoId: string) => {
  try {
    const token = localStorage.getItem("bi_token");

    if (!token) {
      showToast("Please login again", "error");
      return;
    }

    await updateDemoStatus(
      token,
      demoId,
      "LIVE"
    );

    showToast(
      "Demo session is now live",
      "success"
    );

    await loadDemos();
  } catch (error: unknown) {
    showToast(
      error instanceof Error ? error.message : "Failed to mark demo live",
      "error"
    );
  }
};

  const resetMeetingForm = () => {
    setMeetingForm({
      platform: "ZOOM",
      meetingLink: "",
      meetingId: "",
      password: "",
      startTime: "",
      endTime: "",
    });
  };

  const openMeetingForm = (demoId: string) => {
    setMeetingDemoId(demoId);
    resetMeetingForm();
  };

  const closeMeetingForm = () => {
    setMeetingDemoId(null);
    resetMeetingForm();
  };

  const getDemoTypeLabel = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "Video Call";

      case "PHONE":
        return "Phone Call";

      case "FACE_TO_FACE":
        return "Face-to-Face";

      default:
        return type;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED":
        return "bg-blue-100 text-blue-700";

      case "DISPATCHED":
        return "bg-purple-100 text-purple-700";

      case "LIVE":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-gray-100 text-gray-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading demo requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Demo Management
        </h1>

        <p className="text-gray-500 mt-1">
          Manage doctor demo requests and sessions.
        </p>
      </div>

      {/* Empty State */}
      {demos.length === 0 ? (
        <div className="border rounded-xl p-10 text-center">
          <h2 className="text-lg font-semibold">
            No demo requests found
          </h2>

          <p className="text-gray-500 mt-2">
            New demo bookings from doctors will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">

          {demos.map((demo) => (
            <div
              key={demo._id}
              className="border rounded-xl p-5 bg-white shadow-sm"
            >

              {/* Product + Status */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* Product */}
                <div className="flex gap-4">

                  {demo.product?.image ? (
                    <img
                      src={demo.product.image}
                      alt={demo.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                      💊
                    </div>
                  )}

                  <div>
                    <h2 className="font-semibold text-lg">
                      {demo.product?.name || "Product"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {demo.product?.category}
                    </p>

                    <p className="text-sm mt-1">
                      Demo:{" "}
                      <span className="font-medium">
                        {getDemoTypeLabel(demo.demoType)}
                      </span>
                    </p>
                  </div>

                </div>

                {/* Status */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusClass(
                    demo.status
                  )}`}
                >
                  {demo.status}
                </span>

              </div>

              {/* Doctor + Schedule */}
              <div className="border-t mt-5 pt-5 grid md:grid-cols-2 gap-4">

                {/* Doctor */}
                <div>
                  <p className="text-sm text-gray-500">
                    Doctor
                  </p>

                  <p className="font-medium">
                    {demo.doctor?.fullName || "Unknown"}
                  </p>

                  <p className="text-sm text-gray-600">
                    {demo.doctor?.specialization || "N/A"}
                  </p>

                  <p className="text-sm text-gray-600">
                    {demo.doctor?.email || "N/A"}
                  </p>

                  <p className="text-sm text-gray-600">
                    {demo.doctor?.phone || "N/A"}
                  </p>
                </div>

                {/* Schedule */}
                <div>
                  <p className="text-sm text-gray-500">
                    Scheduled Date
                  </p>

                  <p className="font-medium">
                    {new Date(
                      demo.scheduledDate
                    ).toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Requested Date
                  </p>

                  <p className="text-sm">
                    {new Date(
                      demo.scheduledDate
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>

              {/* Doctor Notes */}
              {demo.notes && (
                <div className="border-t mt-5 pt-4">
                  <p className="text-sm text-gray-500">
                    Doctor Notes
                  </p>

                  <p className="text-sm mt-1">
                    {demo.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t mt-5 pt-4 flex flex-wrap gap-2">

                {/* Approve */}
                {demo.status === "PENDING" && (
                  <button
                    onClick={() =>
                      handleApproveDemo(demo._id)
                    }
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Approve Demo
                  </button>
                )}

                {/* Add Meeting */}
                {demo.status === "APPROVED" && (
                  <button
                    onClick={() =>
                      openMeetingForm(demo._id)
                    }
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
                  >
                    Add Meeting Details
                  </button>
                )}

                {/* Mark Live */}
                {demo.status === "DISPATCHED" && (
                  <button
                    onClick={() => handleMarkLive(demo._id)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                  >
                    Mark Live
                  </button>
                )}

              </div>

              {/* Meeting Form */}
              {meetingDemoId === demo._id && (
                <div className="mt-5 border rounded-xl p-5 bg-gray-50">

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Add Private Meeting Details
                    </h3>

                    <button
                      onClick={closeMeetingForm}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">

                    {/* Platform */}
                    <div>
                      <label className="text-sm font-medium">
                        Platform
                      </label>

                      <select
                        value={meetingForm.platform}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            platform:
                              e.target.value as MeetingPlatform,
                          })
                        }
                        className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="ZOOM">
                          Zoom
                        </option>

                        <option value="GOOGLE_MEET">
                          Google Meet
                        </option>

                        <option value="MICROSOFT_TEAMS">
                          Microsoft Teams
                        </option>

                        <option value="WEBEX">
                          Webex
                        </option>

                        <option value="OTHER">
                          Other
                        </option>
                      </select>
                    </div>

                    {/* Meeting Link */}
                    <div>
                      <label className="text-sm font-medium">
                        Meeting Link *
                      </label>

                      <input
                        type="url"
                        value={meetingForm.meetingLink}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            meetingLink: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                      />
                    </div>

                    {/* Meeting ID */}
                    <div>
                      <label className="text-sm font-medium">
                        Meeting ID
                      </label>

                      <input
                        type="text"
                        value={meetingForm.meetingId}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            meetingId: e.target.value,
                          })
                        }
                        placeholder="Meeting ID"
                        className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-sm font-medium">
                        Password
                      </label>

                      <input
                        type="text"
                        value={meetingForm.password}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Meeting password"
                        className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="text-sm font-medium">
                        Start Time *
                      </label>

                      <input
                        type="datetime-local"
                        value={meetingForm.startTime}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="text-sm font-medium">
                        End Time *
                      </label>

                      <input
                        type="datetime-local"
                        value={meetingForm.endTime}
                        onChange={(e) =>
                          setMeetingForm({
                            ...meetingForm,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full mt-1 border rounded-lg px-3 py-2 bg-white"
                      />
                    </div>

                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-2 mt-5">

                    <button
                      onClick={() =>
                        handleAddMeetingDetails(
                          demo._id
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                    >
                      Save Meeting
                    </button>

                    <button
                      onClick={closeMeetingForm}
                      className="px-4 py-2 rounded-lg border text-sm bg-white hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                  </div>

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default RepDemoManagement;