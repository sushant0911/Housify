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
    // If token is placeholder or missing, use no-auth endpoint
    if (!token || token === "placeholder") {
      const response = await api.post(
        `/user/register-no-auth`,
        { 
          email,
          name: userData.name || null,
          image: userData.picture || null
        }
      );
      return response.data;
    }
    // Try with authentication first
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.post(
        `/user/register`,
        { 
          email,
          name: userData.name || null,
          image: userData.picture || null
        },
        { headers }
      );
      return response.data;
    } catch (authError) {
      // Fallback to no-auth endpoint
      const response = await api.post(
        `/user/register-no-auth`,
        { 
          email,
          name: userData.name || null,
          image: userData.picture || null
        }
      );
      return response.data;
    }
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      console.error("Non-auth error in createUser:", error);
    }
    throw error;
  }
};

export const bookVisit = async (date, propertyId, email, token) => {
  try {
    
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
    
    return response.data;
  } catch (error) {
    console.error("bookVisit error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackResponse = await api.post(
          `/user/bookVisit-no-auth/${propertyId}`,
          {
            email,
            id: propertyId,
            date: dayjs(date).format("DD/MM/YYYY"),
          }
        );
        
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
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await api.post(
      `/user/removeBooking/${id}`,
      {
        email,
      },
      {
        headers,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("removeBooking error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackResponse = await api.post(
          `/user/removeBooking-no-auth/${id}`,
          {
            email,
          }
        );
        
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("Fallback removeBooking error:", fallbackError);
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

export const toFav = async (id, email, token) => {
  try {
    
    const response = await api.post(
      `/user/toFav/${id}`,
      {
        email,
      }
    );
    
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
    console.error("getAllFav error:", e);
    // Only show toast for non-authentication errors
    if (e.response?.status !== 401 && e.response?.status !== 404) {
      console.error("Non-auth error in getAllFav:", e);
    }
    throw e
  }
} 


export const getAllBookings = async (email, token) => {
  try {
    
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
    
    if (res.data && res.data.bookedVisits) {
      return res.data.bookedVisits;
    } else {
      return [];
    }
    
  } catch (error) {
    console.error("getAllBookings error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.post(
          `/user/allBookings-no-auth`,
          {
            email,
          }
        );
        
        if (fallbackRes.data && fallbackRes.data.bookedVisits) {
          return fallbackRes.data.bookedVisits;
        } else {
          return [];
        }
      } catch (fallbackError) {
        console.error("Fallback getAllBookings error:", fallbackError);
        // Don't show toast for authentication errors during page load
        if (fallbackError.response?.status !== 401 && fallbackError.response?.status !== 404) {
          console.error("Non-auth fallback error in getAllBookings:", fallbackError);
        }
        throw fallbackError;
      }
    } else if (error.response?.status === 404) {
      // Don't show toast for 404 errors during page load
      console.log("User not found, returning empty bookings");
    } else {
      // Only show toast for non-authentication errors
      if (error.response?.status !== 401) {
        console.error("Non-auth error in getAllBookings:", error);
      }
    }
    throw error;
  }
}


export const testAuth = async (token) => {
  try {
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.get("/residency/test-auth", { headers });
    return res.data;
  } catch (error) {
    console.error("Auth test failed:", error);
    throw error;
  }
};

export const createResidency = async (data, token) => {
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    try {
      const res = await api.post(
        `/residency/create-no-auth`,
        {
          data
        }
      );
      
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
    
    const res = await api.post(
      `/residency/create`,
      {
        data
      },
      {
        headers,
      }
    );
    
    return res.data;
  }catch(error)
  {
    console.error("createResidency error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.post(
          `/residency/create-no-auth`,
          {
            data
          }
        );
        
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

export const getPropertyVisitors = async (email, token) => {
  try {
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await api.post(
      `/user/propertyVisitors`,
      {
        email,
      },
      {
        headers,
      }
    );
    
    if (response.data && response.data.visitors) {
      return response.data.visitors;
    } else {
      return [];
    }
    
  } catch (error) {
    console.error("getPropertyVisitors error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackResponse = await api.post(
          `/user/propertyVisitors-no-auth`,
          {
            email,
          }
        );
        
        if (fallbackResponse.data && fallbackResponse.data.visitors) {
          return fallbackResponse.data.visitors;
        } else {
          return [];
        }
      } catch (fallbackError) {
        console.error("Fallback getPropertyVisitors error:", fallbackError);
        // Don't show toast for authentication errors during page load
        if (fallbackError.response?.status !== 401 && fallbackError.response?.status !== 404) {
          console.error("Non-auth fallback error in getPropertyVisitors:", fallbackError);
        }
        throw fallbackError;
      }
    } else if (error.response?.status === 404) {
      // Don't show toast for 404 errors during page load
      console.log("User not found, returning empty visitors");
    } else {
      // Only show toast for non-authentication errors
      if (error.response?.status !== 401) {
        console.error("Non-auth error in getPropertyVisitors:", error);
      }
    }
    throw error;
  }
};

export const getOwnedProperties = async (email, token) => {
  try {
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await api.post(
      `/residency/owned`,
      {
        email,
      },
      {
        headers,
      }
    );
    
    if (response.data && response.data.properties) {
      return response.data.properties;
    } else {
      return [];
    }
    
  } catch (error) {
    console.error("getOwnedProperties error:", error);
    console.error("Error response:", error.response?.data);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackResponse = await api.post(
          `/residency/owned-no-auth`,
          {
            email,
          }
        );
        
        if (fallbackResponse.data && fallbackResponse.data.properties) {
          return fallbackResponse.data.properties;
        } else {
          return [];
        }
      } catch (fallbackError) {
        console.error("Fallback getOwnedProperties error:", fallbackError);
        // Don't show toast for authentication errors during page load
        if (fallbackError.response?.status !== 401 && fallbackError.response?.status !== 404) {
          console.error("Non-auth fallback error in getOwnedProperties:", fallbackError);
        }
        throw fallbackError;
      }
    } else if (error.response?.status === 404) {
      // Don't show toast for 404 errors during page load
      console.log("User not found, returning empty properties");
    } else {
      // Only show toast for non-authentication errors
      if (error.response?.status !== 401) {
        console.error("Non-auth error in getOwnedProperties:", error);
      }
    }
    throw error;
  }
};

export const updateResidency = async (id, data, token, userEmail) => {
  
  // Add userEmail to the data
  const requestData = {
    ...data,
    userEmail: userEmail
  };
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    try {
      const res = await api.put(
        `/residency/update-no-auth/${id}`,
        {
          data: requestData
        }
      );
      
      return res.data;
    } catch (error) {
      console.error("updateResidency error (no-auth):", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while updating property";
      toast.error(errorMessage);
      throw error;
    }
  }
  
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.put(
      `/residency/update/${id}`,
      {
        data: requestData
      },
      {
        headers,
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("updateResidency error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.put(
          `/residency/update-no-auth/${id}`,
          {
            data: requestData
          }
        );
        
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback updateResidency error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong while updating property";
      toast.error(errorMessage);
      throw error;
    }
  }
};

export const deleteResidency = async (id, email, token) => {
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    try {
      const res = await api.delete(
        `/residency/delete-no-auth/${id}`,
        {
          data: { userEmail: email }
        }
      );
      
      return res.data;
    } catch (error) {
      console.error("deleteResidency error (no-auth):", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while deleting property";
      toast.error(errorMessage);
      throw error;
    }
  }
  
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.delete(
      `/residency/delete/${id}`,
      {
        data: { userEmail: email },
        headers,
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("deleteResidency error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.delete(
          `/residency/delete-no-auth/${id}`,
          {
            data: { userEmail: email }
          }
        );
        
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback deleteResidency error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong while deleting property";
      toast.error(errorMessage);
      throw error;
    }
  }
};

export const acceptVisit = async (visitorEmail, propertyId, propertyOwnerEmail, token) => {
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    try {
      const res = await api.post(
        `/user/accept-visit-no-auth/${visitorEmail}/${propertyId}`,
        {
          propertyOwnerEmail
        }
      );
      
      return res.data;
    } catch (error) {
      console.error("acceptVisit error (no-auth):", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while accepting visit";
      toast.error(errorMessage);
      throw error;
    }
  }
  
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.post(
      `/user/accept-visit/${visitorEmail}/${propertyId}`,
      {
        propertyOwnerEmail
      },
      {
        headers,
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("acceptVisit error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.post(
          `/user/accept-visit-no-auth/${visitorEmail}/${propertyId}`,
          {
            propertyOwnerEmail
          }
        );
        
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback acceptVisit error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong while accepting visit";
      toast.error(errorMessage);
      throw error;
    }
  }
};

export const rescheduleVisit = async (visitorEmail, propertyId, propertyOwnerEmail, newDate, newTime, token) => {
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    try {
      const res = await api.post(
        `/user/reschedule-visit-no-auth/${visitorEmail}/${propertyId}`,
        {
          propertyOwnerEmail,
          newDate,
          newTime
        }
      );
      
      return res.data;
    } catch (error) {
      console.error("rescheduleVisit error (no-auth):", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while rescheduling visit";
      toast.error(errorMessage);
      throw error;
    }
  }
  
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.post(
      `/user/reschedule-visit/${visitorEmail}/${propertyId}`,
      {
        propertyOwnerEmail,
        newDate,
        newTime
      },
      {
        headers,
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("rescheduleVisit error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.post(
          `/user/reschedule-visit-no-auth/${visitorEmail}/${propertyId}`,
          {
            propertyOwnerEmail,
            newDate,
            newTime
          }
        );
        
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback rescheduleVisit error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong while rescheduling visit";
      toast.error(errorMessage);
      throw error;
    }
  }
};

export const discardVisit = async (visitorEmail, propertyId, propertyOwnerEmail, token) => {
  
  // If token is placeholder, skip authentication
  if (token === "placeholder") {
    try {
      const res = await api.post(
        `/user/discard-visit-no-auth/${visitorEmail}/${propertyId}`,
        {
          propertyOwnerEmail
        }
      );
      
      return res.data;
    } catch (error) {
      console.error("discardVisit error (no-auth):", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while discarding visit";
      toast.error(errorMessage);
      throw error;
    }
  }
  
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await api.post(
      `/user/discard-visit/${visitorEmail}/${propertyId}`,
      {
        propertyOwnerEmail
      },
      {
        headers,
      }
    );
    
    return res.data;
  } catch (error) {
    console.error("discardVisit error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    // If authentication fails, try without token as fallback
    if (error.response?.status === 401) {
      try {
        const fallbackRes = await api.post(
          `/user/discard-visit-no-auth/${visitorEmail}/${propertyId}`,
          {
            propertyOwnerEmail
          }
        );
        
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error("Fallback discardVisit error:", fallbackError);
        toast.error("Authentication failed. Please login again.");
        throw fallbackError;
      }
    } else {
      const errorMessage = error.response?.data?.message || "Something went wrong while discarding visit";
      toast.error(errorMessage);
      throw error;
    }
  }
};