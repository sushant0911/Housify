import React, { useContext, useEffect, useRef } from "react";
import UserDetailContext from "../context/UserDetailContext";
import { useQuery } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { getAllBookings, getAllFav } from "../utils/api";

const useBookings = () => {
  const { userDetails, setUserDetails } = useContext(UserDetailContext);
  const queryRef = useRef();
  const { user, isAuthenticated } = useAuth0();

  const isEnabled = Boolean(
    isAuthenticated && user?.email && userDetails?.token
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["allBookings", user?.email],
    queryFn: () => getAllBookings(user?.email, userDetails?.token),
    onSuccess: (data) => {
      setUserDetails((prev) => ({ ...prev, bookings: data }));
    },
    onError: (error) => {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error("Non-auth error in bookings:", error);
      }
      setUserDetails((prev) => ({ ...prev, bookings: [] }));
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

export default useBookings;
