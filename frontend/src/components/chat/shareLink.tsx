import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useParams } from "react-router";

const ShareLinkComponent = ({ sharePage }: { sharePage?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const shareUrl = `${window.location.origin}/share/${params.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (sharePage) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full">
          <div className="rounded-full flex items-center justify-between">
            <div className="flex-1 rounded-full">
              <p className="text-blue-600 font-medium text-xs truncate">
                {shareUrl}
              </p>
            </div>

            <Button
              onClick={handleCopyLink}
              variant={"link"}
              className="border-none bg-none flex items-center gap-2 transition-all duration-200"
            >
              {copied ? (
                <>
                  <Check size={20} />
                </>
              ) : (
                <>
                  <Copy size={20} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full ">
        <div className="bg-gray-100 rounded-full shadow-lg border border-gray-200  flex items-center justify-between">
          {/* URL Display */}
          <div className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full">
            <p className="text-gray-800 font-medium text-sm truncate">
              {shareUrl}
            </p>
          </div>

          <Button
            onClick={handleCopyLink}
            className="bg-purple-600 hover:bg-purple-700  text-white rounded-full -translate-x-2 px-2 py-2 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {copied ? (
              <>
                <Check size={20} />
                <span className="font-medium text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span className="font-medium text-xs">Copy link</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkComponent;
