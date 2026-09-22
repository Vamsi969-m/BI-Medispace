const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface BookDemoData {
  product: string;
  demoType: "VIDEO" | "PHONE" | "FACE_TO_FACE";
  scheduledDate: string;
  notes?: string;
}

export const bookDemo = async (
  token: string,
  demoData: BookDemoData
) => {
  const response = await fetch(`${API_URL}/demos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(demoData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to book demo");
  }

  return data;
};


export const getMyDemos = async (token: string) => {
  const response = await fetch(`${API_URL}/demos/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch demos");
  }

  return data;
};


export const getDemoById = async (
  token: string,
  demoId: string
) => {
  const response = await fetch(
    `${API_URL}/demos/${demoId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch demo");
  }

  return data;
};

export const getAllDemos = async (token: string) => {
  const response = await fetch(`${API_URL}/demos/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch demo requests");
  }

  return data;
};

export const approveDemo = async (token: string, demoId: string) => {
  const response = await fetch(`${API_URL}/demos/${demoId}/approve`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to approve demo");
  }

  return data;
};

export interface MeetingDetails {
  platform: "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "WEBEX" | "OTHER";
  meetingLink: string;
  meetingId?: string;
  password?: string;
  startTime: string;
  endTime: string;
}

export const addMeetingDetails = async (
  token: string,
  demoId: string,
  meetingData: MeetingDetails
) => {
  const response = await fetch(
    `${API_URL}/demos/${demoId}/meeting`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to add meeting details"
    );
  }

  return data;
};

export const updateDemoStatus = async (
  token: string,
  demoId: string,
  status: string
) => {
  const response = await fetch(
    `${API_URL}/demos/${demoId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update demo status"
    );
  }

  return data;
};
