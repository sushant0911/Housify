import React, { useContext, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { createUser } from "../../utils/api";
import useFavourites from "../../hooks/useFavourites";
import useBookings from "../../hooks/useBookings";

const Layout = () => {
  const {
    isAuthenticated,
    user,
    getAccessTokenWithPopup,
    getAccessTokenSilently,
  } = useAuth0();
  const { setUserDetails } = useContext(UserDetailContext);

  // Always call hooks - they will handle authentication internally
  useFavourites();
  useBookings();

  useEffect(() => {
    const getTokenAndRegister = async () => {
      try {
        console.log("Starting user registration process...");
        console.log("User data:", user);

        // Check if we have a token in localStorage first
        const existingToken = localStorage.getItem("access_token");
        if (existingToken) {
          console.log("Found existing token in localStorage");
          setUserDetails((prev) => ({ ...prev, token: existingToken }));
        }

        // Try to get token silently first, then fallback to popup
        let res;
        try {
          console.log("Attempting to get token silently...");
          res = await getAccessTokenSilently({
            authorizationParams: {
              audience: "http://localhost:8000",
              scope: "openid profile email",
            },
          });
          console.log("Token received silently");
        } catch (silentError) {
          console.log("Silent token retrieval failed, trying popup...");
          console.error("Silent error:", silentError);
          try {
            console.log("Attempting to get token via popup...");
            res = await getAccessTokenWithPopup({
              authorizationParams: {
                audience: "http://localhost:8000",
                scope: "openid profile email",
              },
            });
            console.log("Token received via popup");
          } catch (popupError) {
            console.log(
              "Both silent and popup failed, trying alternative approach..."
            );
            console.error("Popup error:", popupError);

            // Try to get token without audience parameter
            try {
              console.log("Trying to get token without audience...");
              res = await getAccessTokenSilently({
                scope: "openid profile email",
              });
              console.log("Token received without audience");
            } catch (noAudienceError) {
              console.log("Token retrieval without audience also failed");
              console.error("No audience error:", noAudienceError);

              // Try to create user without token for now
              if (user?.email) {
                console.log("Attempting to create user without token...");
                try {
                  await createUser(user.email, null, user);
                  console.log("User created without token");
                } catch (createError) {
                  console.log("User creation failed:", createError);
                }
              }

              // Set a placeholder token to allow basic functionality
              console.log("Setting placeholder token for basic functionality");
              setUserDetails((prev) => ({ ...prev, token: "placeholder" }));
              return;
            }
          }
        }

        console.log("Token received:", res ? "Yes" : "No");

        localStorage.setItem("access_token", res);
        setUserDetails((prev) => ({ ...prev, token: res }));
        console.log("Token set in context:", res ? "Yes" : "No");

        // Clear placeholder token if it was set
        if (res && res !== "placeholder") {
          console.log("Real token obtained, clearing any placeholder");
        }

        // Clear any existing bookings data to force a fresh fetch
        setUserDetails((prev) => ({ ...prev, bookings: [] }));

        // Call createUser with current user email and token
        if (user?.email) {
          console.log("Calling createUser with email:", user.email);
          await createUser(user.email, res, user);
          console.log("createUser call completed");
        } else {
          console.log("No user email available");
        }
      } catch (error) {
        console.error("Error during token retrieval or user creation:", error);
      }
    };

    console.log(
      "useEffect triggered - isAuthenticated:",
      isAuthenticated,
      "user email:",
      user?.email
    );

    if (isAuthenticated && user?.email) {
      getTokenAndRegister();
    } else if (!isAuthenticated) {
      // Clear user data when user logs out
      setUserDetails({
        favourites: [],
        bookings: [],
        token: null,
      });
    }
  }, [isAuthenticated, user?.email]);

  return (
    <>
      <div style={{ background: "var(--black)", overflow: "hidden" }}>
        <Header />
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
