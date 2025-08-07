import React, { useState } from "react";
import { type User, type SignedIdentityToken } from "@/types";
import { generateKeyPair, verifySignature } from "@/utils/crypto";
import { KeyIcon, ShieldCheckIcon } from "@/icons";

interface SecurityDashboardProps {
  organizer: User;
}

const KeyDisplay: React.FC<{ title: string; value: string | null }> = ({
  title,
  value,
}) => (
  <div>
    <h4 className="text-sm font-bold text-black mb-1">{title}</h4>
    <div className="p-2 border border-black bg-neutral-100 text-xs text-neutral-600 break-all font-mono">
      {value || "Not generated"}
    </div>
  </div>
);

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({}) => {
  const [keyPair, setKeyPair] = useState<{
    publicKey: string;
    secretKey: string;
  } | null>(null);
  const [tokenToVerify, setTokenToVerify] = useState("");
  const [verificationResult, setVerificationResult] = useState<
    "valid" | "invalid" | "unchecked"
  >("unchecked");

  const handleGenerateKeys = () => {
    setKeyPair(generateKeyPair());
  };

  const handleVerifyToken = () => {
    if (!tokenToVerify) {
      setVerificationResult("unchecked");
      return;
    }
    try {
      const parsedToken: SignedIdentityToken = JSON.parse(tokenToVerify);
      const isValid = verifySignature(
        parsedToken.payload,
        parsedToken.signature,
        parsedToken.publicKey
      );
      setVerificationResult(isValid ? "valid" : "invalid");
    } catch (e) {
      setVerificationResult("invalid");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Key Management Panel */}
      <div className="bg-white border border-black p-6">
        <div className="flex items-center border-b border-black pb-4 mb-4">
          <KeyIcon className="w-6 h-6 mr-3 text-black" />
          <h3 className="text-xl font-bold text-black">
            Key Management (Simulation)
          </h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            In a real application, your secret key would be securely stored. For
            this simulation, you can generate a new keypair. This keypair is not
            persisted.
          </p>
          {keyPair && (
            <div className="space-y-3 p-4 border border-black bg-neutral-50">
              <KeyDisplay
                title="Public Key (base64)"
                value={keyPair.publicKey}
              />
              <KeyDisplay
                title="Secret Key (base64)"
                value={keyPair.secretKey}
              />
            </div>
          )}
          <button
            onClick={handleGenerateKeys}
            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            {keyPair ? "Regenerate Keypair" : "Generate Keypair"}
          </button>
        </div>
      </div>

      {/* Token Verification Panel */}
      <div className="bg-white border border-black p-6">
        <div className="flex items-center border-b border-black pb-4 mb-4">
          <ShieldCheckIcon className="w-6 h-6 mr-3 text-black" />
          <h3 className="text-xl font-bold text-black">Token Verification</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Paste the full identity token string (from a QR code) to verify its
            authenticity.
          </p>
          <div>
            <label
              htmlFor="token-verify"
              className="block text-sm font-bold text-black mb-1"
            >
              Identity Token String
            </label>
            <textarea
              id="token-verify"
              rows={6}
              value={tokenToVerify}
              onChange={(e) => {
                setTokenToVerify(e.target.value);
                setVerificationResult("unchecked");
              }}
              className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm font-mono text-xs"
              placeholder='{"payload":{...},"signature":"...","publicKey":"..."}'
            />
          </div>

          {verificationResult !== "unchecked" && (
            <div
              className={`p-3 border ${
                verificationResult === "valid"
                  ? "bg-green-100 border-green-800 text-green-800"
                  : "bg-red-100 border-red-800 text-red-800"
              }`}
            >
              <p className="font-bold text-sm">
                {verificationResult === "valid"
                  ? "VALID SIGNATURE"
                  : "INVALID SIGNATURE"}
              </p>
              <p className="text-xs">
                {verificationResult === "valid"
                  ? "The token is authentic and has not been tampered with."
                  : "The token is not authentic or has been altered."}
              </p>
            </div>
          )}

          <button
            onClick={handleVerifyToken}
            className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
          >
            Verify Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
