import { useContext, useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import useAuthCheck from "../../hooks/useAuthCheck";
import { useMutation, useQueryClient } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { checkFavourites } from "../../utils/common";
import { toFav } from "../../utils/api";

const Heart = ({ id }) => {
  const [heartColor, setHeartColor] = useState("white");
  const { validateLogin } = useAuthCheck();
  const { user } = useAuth0();
  const queryClient = useQueryClient();

  const {
    userDetails: { favourites, token },
    setUserDetails,
  } = useContext(UserDetailContext);

  useEffect(() => {
    setHeartColor(() => checkFavourites(id, favourites));
  }, [favourites]);

  const { mutate, isLoading } = useMutation({
    mutationFn: () => toFav(id, user?.email),
    onSuccess: (response) => {
      // Update the local state with the response from the backend
      if (response && response.user && response.user.favResidenciesID) {
        setUserDetails((prev) => ({
          ...prev,
          favourites: response.user.favResidenciesID,
        }));
      }
      // Invalidate and refetch favorites
      queryClient.invalidateQueries("allFavourites");
    },
    onError: (error) => {
      console.error("Error updating favorites:", error);
    },
  });

  const handleLike = () => {
    console.log("handleLike called - email:", user?.email);
    if (validateLogin() && !isLoading) {
      mutate();
    }
  };

  return (
    <AiFillHeart
      size={24}
      color={heartColor}
      onClick={(e) => {
        e.stopPropagation();
        handleLike();
      }}
      style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
    />
  );
};

export default Heart;
