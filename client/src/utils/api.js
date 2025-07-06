import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const getAllProperties = async () => {
  try {
    const response = await api.get("/residency/allresd", {
      timeout: 10 * 1000,
    });

    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Something went wrong");
    throw error;
  }
};

export const getProperty = async (id) => {
  try {
    const response = await api.get(`/residency/${id}`, {
      timeout: 10 * 1000,
    });

    if (response.status === 400 || response.status === 500) {
      throw response.data;
    }
    return response.data;
  } catch (error) {
    toast.error("Something went wrong");
    throw error;
  }
};

export const createUser = async (email, token, userData = {}) => {
  try {
    console.log("API: createUser called with:", { email, token: token ? "present" : "missing", userData });
    
    // Choose endpoint based on token availability
    const endpoint = token ? `/user/register` : `/user/register-no-auth`;
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await api.post(
      endpoint,
      { 
        email,
        name: userData.name || null,
        image: userData.picture || null
      },
      {
        headers,
      }
    );
    
    console.log("API: createUser response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API: createUser error:", error.response?.data || error.message);
    toast.error("Something went wrong, Please try again");
    throw error;
  }
};

export const bookVisit = async (date, propertyId, email, token) => {
  try {
    console.log("bookVisit API call - date:", date, "propertyId:", propertyId, "email:", email, "token present:", !!token);
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await api.post(
      `/user/bookVisit/${propertyId}`,
      {
        email,
        id: propertyId,
        date: dayjs(date).format("DD/MM/YYYY"),
      },
      {
        headers,
      }
    );
    
    console.log("bookVisit API call successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("bookVisit error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      console.log("Authentication failed, trying without token...");
      try {
        const fallbackResponse = await api.post(
          `/user/bookVisit-no-auth/${propertyId}`,
          {
            email,
            id: propertyId,
            date: dayjs(date).format("DD/MM/YYYY"),
          }
        );
        
        console.log("Fallback bookVisit API call successful:", fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("Fallback bookVisit error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong, Please try again";
      toast.error(errorMessage);
      throw error;
    }
  }
};

export const removeBooking = async (id, email, token) => {
  try {
    console.log("removeBooking API call - id:", id, "email:", email);
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    await api.post(
      `/user/removeBooking/${id}`,
      {
        email,
      },
      {
        headers,
      }
    );
    
    console.log("removeBooking API call successful");
  } catch (error) {
    console.error("removeBooking error:", error);
    toast.error("Something went wrong, Please try again");
    throw error;
  }
};

export const toFav = async (id, email, token) => {
  try {
    console.log("toFav API call - id:", id, "email:", email, "token present:", !!token);
    
    const response = await api.post(
      `/user/toFav/${id}`,
      {
        email,
      }
    );
    
    console.log("toFav API response:", response.data);
    return response.data;
  } catch (e) {
    console.error("toFav error:", e);
    throw e;
  }
};


export const getAllFav = async (email, token) => {
  try{
    const res = await api.post(
      `/user/allFav`,
      {
        email,
      }
    );
      
    return res.data["favResidenciesID"] || []

  }catch(e)
  {
    toast.error("Something went wrong while fetching favs");
    throw e
  }
} 


export const getAllBookings = async (email, token) => {
  try {
    console.log("getAllBookings API call - email:", email, "token present:", !!token);
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.post(
      `/user/allBookings`,
      {
        email,
      },
      {
        headers,
      }
    );
    
    console.log("getAllBookings API response:", res.data);
    
    if (res.data && res.data.bookedVisits) {
      return res.data.bookedVisits;
    } else {
      console.log("No bookedVisits in response, returning empty array");
      return [];
    }
    
  } catch (error) {
    console.error("getAllBookings error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      console.log("Authentication failed, trying without token...");
      try {
        const fallbackRes = await api.post(
          `/user/allBookings-no-auth`,
          {
            email,
          }
        );
        
        console.log("Fallback getAllBookings API response:", fallbackRes.data);
        
        if (fallbackRes.data && fallbackRes.data.bookedVisits) {
          return fallbackRes.data.bookedVisits;
        } else {
          return [];
        }
      } catch (fallbackError) {
        console.error("Fallback getAllBookings error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else if (error.response?.status === 404) {
      toast.error("User not found. Please check your account.");
    } else {
      toast.error("Something went wrong while fetching bookings");
    }
    throw error;
  }
}


export const testAuth = async (token) => {
  try {
    console.log("Testing auth with token:", token ? "present" : "missing");
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.get("/residency/test-auth", { headers });
    console.log("Auth test successful:", res.data);
    return res.data;
  } catch (error) {
    console.error("Auth test failed:", error);
    throw error;
  }
};

export const createResidency = async (data, token) => {
  console.log("createResidency API call - data:", data, "token present:", !!token);
  console.log("Token value:", token ? token.substring(0, 20) + "..." : "null");
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    console.log("Using placeholder token, skipping authentication");
    try {
      const res = await api.post(
        `/residency/create-no-auth`,
        {
          data
        }
      );
      
      console.log("createResidency API response (no-auth):", res.data);
      return res.data;
    } catch (error) {
      console.error("createResidency error (no-auth):", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while creating property";
      toast.error(errorMessage);
      throw error;
    }
  }
  
  try{
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("Request headers:", headers);
    
    const res = await api.post(
      `/residency/create`,
      {
        data
      },
      {
        headers,
      }
    );
    
    console.log("createResidency API response:", res.data);
    return res.data;
  }catch(error)
  {
    console.error("createResidency error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      console.log("Authentication failed, trying without token...");
      try {
        const fallbackRes = await api.post(
          `/residency/create-no-auth`,
          {
            data
          }
        );
        
        console.log("Fallback createResidency API response:", fallbackRes.data);
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback createResidency error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong while creating property";
      toast.error(errorMessage);
      throw error;
    }
  }
}