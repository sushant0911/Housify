import React, { useContext, useEffect, useRef } from "react";
import UserDetailContext from "../context/UserDetailContext";
import { useQuery } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { getPropertyVisitors } from "../utils/api";

const usePropertyVisitors = () => {
  const { userDetails } = useContext(UserDetailContext);
  const queryRef = useRef();
  const { user, isAuthenticated } = useAuth0();

  // Ensure all conditions are boolean
  const isEnabled = Boolean(
    isAuthenticated && user?.email && userDetails?.token
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["propertyVisitors", user?.email],
    queryFn: () => getPropertyVisitors(user?.email, userDetails?.token),
    onSuccess: (data) => {
      console.log("Property visitors fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Error fetching property visitors:", error);
      // Don't show toast for authentication errors on page load
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error("Non-auth error in property visitors:", error);
      }
    },
    enabled: isEnabled,
    staleTime: 30000,
    retry: 1,
  });

  queryRef.current = refetch;

  useEffect(() => {
    if (isAuthenticated && user?.email && userDetails?.token) {
      queryRef.current && queryRef.current();
    }
  }, [userDetails?.token, isAuthenticated, user?.email]);

  return { data, isError, isLoading, refetch };
};

export default usePropertyVisitors;
