import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-ls532ldoa0brzf46.us.auth0.com"
      clientId="G8hjLURB64trhZQMXEqJiDafW4mrUbJi"
      authorizationParams={{
        redirect_uri: "http://localhost:5173/",
        // adding the authorization
      }}
      audience="http://localhost:8000"
      scope="openid profile email"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
