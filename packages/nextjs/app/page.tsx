"use client";

import { useEffect } from "react";
import type { NextPage } from "next";

const Landing: NextPage = () => {
  useEffect(() => {
    // Redirect to Webflow site
    window.location.href = "https://noma-ca2581.webflow.io/";
  }, []);

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <p className="text-base-content">Redirecting to NOMA landing page...</p>
        <p className="text-sm text-base-content/70 mt-2">
          If you are not redirected,{" "}
          <a
            href="https://noma-ca2581.webflow.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Landing;
