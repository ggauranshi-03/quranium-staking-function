"use client";
import React from "react";
import ConnectButton from "../ConnectButton/ConnectButton";
import { quranium } from "../../../../../public/assests/qrnLogo";
import Image from "next/image";
const NavBar: React.FunctionComponent = () => {
  return (
    <nav className="flex items-center w-full sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#C9C9C980] p-4 shadow-sm">
      <div className="flex items-center">
        <Image src={quranium} alt="Logo" className="h-8 w-40" />
      </div>
      <div className="flex-grow"></div>
      <div className="flex items-center">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default NavBar;
