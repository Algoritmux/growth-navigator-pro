import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Fallback para não derrubar a aplicação quando o .env ainda não foi criado.
const RESOLVED_GOOGLE_CLIENT_ID =
    GOOGLE_CLIENT_ID?.trim() ||
    "934848081124-584769e5ibh5jgrjptmaka4tpa9uvq1k.apps.googleusercontent.com";

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
