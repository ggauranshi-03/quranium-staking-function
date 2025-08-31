"use client";

import React, { useState } from "react";
import { Wallet2Icon } from "lucide-react";
import { useQsafeQL1FullInfo } from "@/hooks/useQsafeQL1FullInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  disconnectStep,
  qsafeExtension,
} from "../../../../../public/assests/wallet";

const ConnectButton = () => {
  const { address, isConnected, connect } = useQsafeQL1FullInfo();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    try {
      connect();
      // window.location.reload();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return (
    <div className="block">
      {isConnected && address?.length ? (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <button
              className="hidden md:block bg-gradient-to-r from-[#4F46E5] to-[#1E40AF] text-white px-5 py-3 rounded-full font-bold font-montserrat hover:brightness-110 transition duration-300 ease-in-out"
              onClick={() => setShowModal(true)}
            >
              {`${address.slice(0, 4)}...${address.slice(-4)}`}
            </button>
          </DialogTrigger>

          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>You&apos;re Connected</DialogTitle>
              <DialogDescription className="mt-2 text-sm">
                Follow these steps to disconnect your wallet manually:
              </DialogDescription>
            </DialogHeader>

            <Image src={qsafeExtension} alt="qsafe extension step" />
            <Image src={disconnectStep} alt="disconnect step" />

            <DialogClose asChild>
              <button className="mt-4 w-full bg-gradient-to-r from-[#4F46E5] to-[#1E40AF] text-white px-5 py-3 rounded-full font-bold hover:brightness-110 transition duration-300 ease-in-out">
                Got it
              </button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      ) : (
        <div>
          {/* Desktop View */}
          <button
            onClick={handleConnect}
            className="md:flex items-center justify-center gap-2 hidden w-auto h-auto px-5 py-3 rounded-full font-bold font-montserrat bg-gradient-to-r from-[#4F46E5] to-[#1E40AF] text-white hover:brightness-110 transition duration-300 ease-in-out"
          >
            Connect Wallet
            <Wallet2Icon className="w-5 h-5 text-white" />
          </button>

          {/* Mobile View */}
          <button
            onClick={handleConnect}
            className="flex md:hidden items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#4F46E5] text-white hover:brightness-110 transition duration-300 ease-in-out"
          >
            <Wallet2Icon className="w-8 h-8 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
