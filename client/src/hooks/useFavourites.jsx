import React, { useContext, useEffect, useRef } from "react";
import UserDetailContext from "../context/UserDetailContext";
import { useQuery } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { getAllFav } from "../utils/api";

const useFavourites = () => {
  const { userDetails, setUserDetails } = useContext(UserDetailContext);
  const queryRef = useRef();
  const { user, isAuthenticated } = useAuth0();

  // Ensure all conditions are boolean
  const isEnabled = Boolean(isAuthenticated && user?.email);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: "allFavourites",
    queryFn: () => getAllFav(user?.email),
    onSuccess: (data) => {
      if (data) {
        setUserDetails((prev) => ({ ...prev, favourites: data }));
      }
    },
    enabled: isEnabled,
    staleTime: 30000,
    retry: 1,
  });

  queryRef.current = refetch;

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      queryRef.current && queryRef.current();
    }
  }, [user?.email, isAuthenticated]);

  return { data, isError, isLoading, refetch };
};

export default useFavourites;
