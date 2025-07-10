import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useAuth0();

  // Show loading while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
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

  // Handle Auth0 errors
  if (error) {
    console.error("Auth0 error:", error);
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <div>Authentication error. Please try refreshing the page.</div>
      </div>
    );
  }

  // Only redirect if not authenticated and not loading
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
