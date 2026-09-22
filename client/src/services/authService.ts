const API_URL = import.meta.env.VITE_API_BASE_URL|| "http://localhost:5000/api";

export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
}) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const getCurrentUser = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get user");
  }

  return data;
};

export const updateCurrentUser = async (
  token: string,
  userData: {
    fullName: string;
    email: string;
    phone?: string;
    specialization?: string;
    avatar?: string;
  }
) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};
