import React, { useContext, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import UserDetailContext from "../../context/UserDetailContext";
import { createUser } from "../../utils/api";
import useFavourites from "../../hooks/useFavourites";
import useBookings from "../../hooks/useBookings";
import usePropertyVisitors from "../../hooks/usePropertyVisitors";
import useOwnedProperties from "../../hooks/useOwnedProperties";
import { PuffLoader } from "react-spinners";

const Layout = () => {
  const {
    isAuthenticated,
    user,
    getAccessTokenWithPopup,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();
  const { setUserDetails } = useContext(UserDetailContext);

  useFavourites();
  useBookings();
  usePropertyVisitors();
  useOwnedProperties();

  useEffect(() => {
    const getTokenAndRegister = async () => {
      try {
        const existingToken = localStorage.getItem("access_token");
        if (existingToken && existingToken !== "placeholder") {
          setUserDetails((prev) => ({ ...prev, token: existingToken }));
        }
        let res = null;
        try {
          res = await getAccessTokenSilently({
            authorizationParams: {
              audience: "http://localhost:8000",
              scope: "openid profile email",
            },
          });
        } catch {
          try {
            res = await getAccessTokenWithPopup({
              authorizationParams: {
                audience: "http://localhost:8000",
                scope: "openid profile email",
              },
            });
          } catch {
            try {
              res = await getAccessTokenSilently({
                scope: "openid profile email",
              });
            } catch {
              res = "placeholder";
            }
          }
        }
        if (res && res !== "placeholder") {
          localStorage.setItem("access_token", res);
          setUserDetails((prev) => ({ ...prev, token: res }));
        } else {
          setUserDetails((prev) => ({ ...prev, token: "placeholder" }));
        }
        if (user?.email) {
          try {
            await createUser(user.email, res, user);
          } catch {}
        }
      } catch {
        setUserDetails((prev) => ({ ...prev, token: "placeholder" }));
      }
    };
    if (isAuthenticated && user?.email) {
      getTokenAndRegister();
    } else if (!isAuthenticated) {
      setUserDetails({
        favourites: [],
        bookings: [],
        token: null,
      });
      localStorage.removeItem("access_token");
    }
  }, [isAuthenticated, user?.email]);

  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "100vh" }}>
        <PuffLoader
          height="80"
          width="80"
          radius={1}
          color="#4066ff"
          aria-label="puff-loading"
        />
      </div>
    );
  }

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
