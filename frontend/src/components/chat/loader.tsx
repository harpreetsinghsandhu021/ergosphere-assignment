import { useState } from "react";

export default function LineLoader() {
  const [isLoading, _] = useState(true);

  return (
    <div>
      {/* Loading Bar */}
      <div className="fixed top-0 left-80 right-0 h-1 bg-transparent z-50">
        <div
          className={`h-full bg-black transition-all duration-300 ease-out ${
            isLoading ? "animate-loading" : "w-0"
          }`}
          style={{
            animation: isLoading
              ? "loading 2s cubic-bezier(0.4, 0, 0.2, 1) infinite"
              : "none",
          }}
        />
      </div>

      <style>{`
        @keyframes loading {
          0% {
            width: 0%;
            opacity: 1;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
