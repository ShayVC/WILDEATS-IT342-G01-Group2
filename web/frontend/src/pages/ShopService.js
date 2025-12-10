import axios from "axios";

const API_URL = "/api/shops"; 


export const getShopById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const deleteShop = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};


export const createShop = async (shopData) => {
  try {
    const response = await axios.post(API_URL, shopData);
    return response.data;
  } catch (error) {
    console.error("Error creating shop:", error);
    throw error;
  }
};
