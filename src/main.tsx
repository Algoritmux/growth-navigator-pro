import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import { captureAttribution, installClickTracking } from "./lib/analytics";
import "./index.css";

captureAttribution();
installClickTracking();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const PLACEHOLDER_GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com";

// Ignore placeholder values from .env to avoid invalid_client at runtime.
const RESOLVED_GOOGLE_CLIENT_ID =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== PLACEHOLDER_GOOGLE_CLIENT_ID
    ? GOOGLE_CLIENT_ID
    : "934848081124-584769e5ibh5jgrjptmaka4tpa9uvq1k.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={RESOLVED_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
