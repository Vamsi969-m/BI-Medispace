const API_URL = "http://localhost:5000/api";

export interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  manufacturedIn: string;
  purpose: string;
  uses: string[];
  price: number;
  rating: number;
  isActive: boolean;
}

export const getProducts = async (token: string) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch products");
  }

  return data;
};

export const getProductById = async (
  token: string,
  productId: string
) => {
  const response = await fetch(
    `${API_URL}/products/${productId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch product"
    );
  }

  return data;
};