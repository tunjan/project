import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import FocusTrap from "focus-trap-react";
import { type SignedIdentityToken } from "@/types";

interface QrCodeModalProps {
  token: SignedIdentityToken;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ token, onClose }) => {
  const tokenString = JSON.stringify(token);

  return (
    <FocusTrap>
      <div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white border-4 border-black p-8 relative w-full max-w-md m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-black">
              Verified Identity
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Scan this code or copy the text below.
            </p>
          </div>

          <div className="my-6 flex justify-center">
            <QRCodeCanvas
              value={tokenString}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              level="L"
              includeMargin={true}
              className="border border-black"
            />
          </div>

          <div>
            <label
              htmlFor="token-string"
              className="block text-xs font-bold text-black mb-1"
            >
              Token Data
            </label>
            <textarea
              id="token-string"
              readOnly
              rows={4}
              value={tokenString}
              className="w-full border border-black p-2 text-xs font-mono bg-neutral-100 text-neutral-700"
            />
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </FocusTrap>
  );
};

export default QrCodeModal;
