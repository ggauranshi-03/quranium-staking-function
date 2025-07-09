"use client";

import { useQsafeQL1FullInfo } from "@/hooks/useQsafeQL1FullInfo";
import FixedRewardStakingComponent from "../FixedRewardStaking/fixedRewardStakingComponent";

export default function StakingWrapper() {
  const { address, isConnected } = useQsafeQL1FullInfo();

  return (
    <FixedRewardStakingComponent userAddress={isConnected ? address : null} />
  );
}
