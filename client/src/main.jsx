import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
     domain="dev-rcyesob4j4uh7807.us.auth0.com"
     clientId="0gy6V4cDaqa46as4dLOSkwAumD5oCcxJ"
     authorizationParams={{
      redirect_uri: "https://housify-six.vercel.app"
      // adding the authorization
     }}
     audience="http://localhost:8000"
     scope="openid profile email"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
