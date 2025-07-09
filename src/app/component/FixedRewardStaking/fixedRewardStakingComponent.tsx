"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
const CONTRACT_ADDRESS = "0xf3ffe752da5c73324afe19c1bcc09836b5a510b1";
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TopUp",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [],
    name: "REWARD_RATE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getStakedBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getWithdrawableAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "topUpRewardPool",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface StakeInfo {
  stakedBalance: string;
  currentReward: string;
  withdrawableAmount: string;
}
interface FixedRewardStakingProps {
  userAddress: string | null;
}
const FixedRewardStakingComponent = ({
  userAddress,
}: FixedRewardStakingProps) => {
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [contractBalance, setContractBalance] = useState<string>("0");

  const fetchStakeInfo = async () => {
    if (!userAddress) {
      setStakeInfo(null);
      return;
    }
    try {
      const qsafeProvider = window.qsafe?.providers?.ethereum;
      if (!qsafeProvider) {
        throw new Error("QSafe provider not found");
      }
      const provider = new ethers.BrowserProvider(qsafeProvider);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const [stakedBalance, withdrawableAmount, ownerAddress, balance] =
        await Promise.all([
          contract.getStakedBalance(userAddress),
          contract.getWithdrawableAmount(userAddress),
          contract.owner(),
          contract.getContractBalance(),
        ]);

      // Calculate reward from withdrawable amount
      const currentReward = withdrawableAmount - stakedBalance;

      setIsOwner(ownerAddress.toLowerCase() === userAddress.toLowerCase());
      setContractBalance(ethers.formatEther(balance));

      setStakeInfo({
        stakedBalance: ethers.formatEther(stakedBalance),
        currentReward: ethers.formatEther(currentReward),
        withdrawableAmount: ethers.formatEther(withdrawableAmount),
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch stake information");
    }
  };

  // Initialize provider and signer
  useEffect(() => {
    if (userAddress) {
      fetchStakeInfo();
    }
  }, [userAddress]);

  // QSafe-specific transaction handling
  const sendQSafeTransaction = async (
    functionName: string,
    value: bigint = BigInt(0)
  ) => {
    if (!window.qsafe?.providers?.ethereum || !userAddress) {
      throw new Error("QSafe wallet not connected");
    }

    const qsafeProvider = window.qsafe.providers.ethereum;
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // 1. Encode function data
    const data = contractInterface.encodeFunctionData(functionName);

    // 2. Get gas price
    let gasPrice: string;
    try {
      const gasPriceResponse = await fetch(
        "https://tqrn-node1.quranium.org/node",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_gasPrice",
            params: [],
            id: 1,
          }),
        }
      );

      const gasPriceResult = await gasPriceResponse.json();
      if (gasPriceResult.error) {
        throw new Error(
          `Failed to fetch gas price: ${gasPriceResult.error.message}`
        );
      }
      gasPrice = gasPriceResult.result;
    } catch (error: any) {
      console.warn("Failed to fetch gas price:", error.message);
      gasPrice = "0x3b9aca00"; // 1 gwei default
    }

    // 3. Estimate gas
    let gasLimit: string;
    try {
      const estimateResponse = await fetch(
        "https://tqrn-node1.quranium.org/node",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_estimateGas",
            params: [
              {
                from: userAddress,
                to: CONTRACT_ADDRESS,
                data,
                value: "0x" + value.toString(16),
              },
            ],
            id: 1,
          }),
        }
      );

      const estimateResult = await estimateResponse.json();
      if (estimateResult.error) {
        throw new Error(
          `Gas estimation failed: ${estimateResult.error.message}`
        );
      }

      // Add 20% buffer
      const estimatedGas = BigInt(estimateResult.result);
      const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100);
      gasLimit = "0x" + gasWithBuffer.toString(16);
    } catch (gasError: any) {
      console.warn("Gas estimation failed:", gasError.message);
      gasLimit = "0x2dc6c0"; // Default 3,000,000 gas
    }

    // 4. Build transaction
    const transaction = {
      from: userAddress,
      to: CONTRACT_ADDRESS,
      data,
      value: "0x" + value.toString(16),
      gas: gasLimit,
      gasPrice,
    };

    // 5. Send transaction
    const txHash = await qsafeProvider.request({
      method: "eth_sendTransaction",
      params: [transaction],
    });

    // 6. Poll for receipt
    const maxAttempts = 30;
    const pollInterval = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const receiptResponse = await fetch(
          "https://tqrn-node1.quranium.org/node",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_getTransactionReceipt",
              params: [txHash],
              id: 1,
            }),
          }
        );

        const receiptResult = await receiptResponse.json();
        if (receiptResult.error) {
          console.warn(
            `Attempt ${attempt}: Failed to fetch receipt: ${receiptResult.error.message}`
          );
          continue;
        }

        const txReceipt = receiptResult.result;
        if (txReceipt && txReceipt.blockNumber) {
          if (txReceipt.status !== "0x1") {
            throw new Error("Transaction failed");
          }
          return txHash;
        }
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        console.warn(
          `Attempt ${attempt}: Error fetching receipt: ${error.message}`
        );
      }
    }

    throw new Error("Transaction receipt not found after maximum attempts");
  };

  // Handle stake submission
  const handleStake = async () => {
    if (!userAddress || !stakeAmount) {
      setError("Missing required parameters");
      return;
    }

    try {
      setLoading(true);
      const value = ethers.parseEther(stakeAmount);
      await sendQSafeTransaction("stake", value);

      // Refresh data after successful stake
      await fetchStakeInfo();
      setStakeAmount("");
      setError("");
    } catch (err: any) {
      console.error("Staking error:", err);
      setError(`Staking failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!userAddress) {
      setError("Wallet not connected");
      return;
    }

    try {
      setLoading(true);
      await sendQSafeTransaction("withdraw");

      // Refresh data after withdrawal
      await fetchStakeInfo();
      setError("");
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setError(`Withdrawal failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle top-up reward pool
  const handleTopup = async () => {
    if (!userAddress || !topupAmount) {
      setError("Missing required parameters");
      return;
    }

    try {
      setLoading(true);
      const value = ethers.parseEther(topupAmount);
      await sendQSafeTransaction("topUpRewardPool", value);

      // Refresh data after top-up
      await fetchStakeInfo();
      setTopupAmount("");
      setError("");
    } catch (err: any) {
      console.error("Topup error:", err);
      setError(`Topup failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto py-4 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-300 mb-4 md:mb-0">
          Quranium
          <span className="block text-sm text-indigo-200 mt-1">
            The Uncrackable foundation of Digital Era
          </span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto mt-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-900/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Fixed Yield Staking
            </h2>
            <p className="text-indigo-200">
              Stake and earn 20% fixed rewards with Quranium
            </p>
            <div className="mt-2 p-2 bg-indigo-900/50 rounded-lg inline-block">
              <p className="text-indigo-200">
                Contract Balance:
                <span className="font-bold ml-2">{contractBalance} QRN</span>
              </p>
            </div>
          </div>

          {/* Stake Form */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-indigo-500/30">
            <h2 className="text-xl font-semibold mb-4 text-indigo-200">
              Stake QRN
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="QRN amount"
                className="flex-1 p-3 bg-gray-700 border border-indigo-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                step="0.001"
              />
              <button
                onClick={handleStake}
                disabled={loading || !stakeAmount}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Stake"}
              </button>
            </div>
          </div>

          {/* Withdraw Button */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleWithdraw}
              disabled={
                loading || !stakeInfo || Number(stakeInfo.stakedBalance) === 0
              }
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Withdraw All"}
            </button>
          </div>

          {/* Owner Topup Section */}
          {isOwner && (
            <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <h2 className="text-xl font-semibold mb-4 text-purple-200">
                Reward Pool Top-up (Owner Only)
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="QRN amount"
                  className="flex-1 p-3 bg-gray-700 border border-purple-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  step="0.001"
                />
                <button
                  onClick={handleTopup}
                  disabled={loading || !topupAmount}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Top-up Rewards"}
                </button>
              </div>
            </div>
          )}

          {/* Stake Information */}
          {stakeInfo && (
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-indigo-500/30">
              <h2 className="text-xl font-semibold mb-4 text-indigo-200">
                Your Staking Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Staked Balance:</p>
                  <p className="font-bold text-lg">
                    {stakeInfo.stakedBalance} QRN
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-indigo-200">Current Reward:</p>
                  <p className="font-bold text-lg text-green-400">
                    {stakeInfo.currentReward} QRN
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg col-span-1 md:col-span-2">
                  <p className="text-indigo-200">Total Withdrawable:</p>
                  <p className="font-bold text-lg text-amber-400">
                    {stakeInfo.withdrawableAmount} QRN
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={fetchStakeInfo}
              disabled={loading}
              className="px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh Data
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 py-4 text-center text-indigo-300">
        <p>
          © {new Date().getFullYear()} Quranium Network. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default FixedRewardStakingComponent;
