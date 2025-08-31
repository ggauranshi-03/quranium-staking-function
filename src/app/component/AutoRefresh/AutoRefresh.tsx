"use client";
import { useEffect } from "react";

const AutoRefreshHandler = () => {
  useEffect(() => {
    const checkWalletConnection = () => {
      const walletConnected = localStorage.getItem("wallet_connected");

      if (walletConnected === "true") {
        // Clear the flag and refresh the page
        localStorage.removeItem("wallet_connected");
        window.location.reload();
      }
    };

    // Check every 500ms for wallet connection
    const interval = setInterval(checkWalletConnection, 500);

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

export default AutoRefreshHandler;
