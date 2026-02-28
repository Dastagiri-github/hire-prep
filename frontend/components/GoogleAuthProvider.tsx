"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { env } from "@/lib/env";
import React from "react";

export default function GoogleAuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "not_provided";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
