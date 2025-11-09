import { SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import Messages from "../components/chat/messages";
import { AppSidebar } from "../components/navigation/appSidebar";
import { useChatStore } from "../store/chatStore";
import { IconAnalyze } from "@tabler/icons-react";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Info, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import ShareLinkComponent from "../components/chat/shareLink";

const Chat = ({ share }: { share: boolean }) => {
  const [analyzedConversationData, setAnalyzedConversationData] = useState<{
    summary: string;
    key_points: string[];
  } | null>(null);

  const currentConversation = useChatStore(
    (state: any) => state.currentConversation
  );

  const isLoading = useChatStore((state: any) => state.isLoading);
  const analyzeCurrentConversation = useChatStore(
    (state: any) => state.analyzeCurrentConversation
  );

  return (
    <>
      {!share && <AppSidebar />}
      <SidebarInset className="space-grotesk-font ">
        <header className="flex h-14 shrink-0 items-center gap-2 sticky top-0 bg-white dark:bg-black">
          <div className="flex flex-1 items-center justify-center gap-2 px-3">
            {!share && <SidebarTrigger />}
            {!share && (
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            )}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage
                    className={`line-clamp-1 ${
                      share && "text-3xl font-extrabold w-3xl text-left"
                    }`}
                  >
                    {currentConversation && currentConversation.title}{" "}
                    {currentConversation &&
                      currentConversation.title &&
                      currentConversation.title.length === 50 &&
                      "..."}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {!share && (
              <Button
                onClick={async () => {
                  const data = await analyzeCurrentConversation();
                  setAnalyzedConversationData(data);
                }}
                className="ml-auto text-xs"
                variant={"outline"}
              >
                <IconAnalyze className={`${isLoading && "animate-spin"}`} />
                Analyze Conversation
              </Button>
            )}

            <Dialog>
              {!share && (
                <DialogTrigger asChild>
                  <Button className="text-xs">
                    <Share2 /> Share Conversation
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Shareable public link</DialogTitle>
                  <DialogDescription>
                    <ShareLinkComponent />
                    <p className="pt-2">
                      <Info className="inline-block size-4" />
                      <span className="pl-1 text-xs">
                        Public links can be reshared. Share responsibly. If
                        sharing with third parties, their policies apply.
                      </span>
                    </p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-20">
          <div className="mx-auto h-[90%] w-full max-w-3xl rounded-xl">
            {share && (
              <div className="flex flex-col items-start">
                <ShareLinkComponent sharePage={true} />
                <p className="text-xs font-normal">
                  Created with{" "}
                  <strong className="font-bold"> Gemini 2.5 Flash</strong>{" "}
                  {currentConversation &&
                    formatDate(currentConversation.start_timestamp)}
                </p>
              </div>
            )}
            <Messages share={share} />
          </div>
        </div>
      </SidebarInset>
      <Sheet open={analyzedConversationData !== null}>
        <SheetContent
          onClose={() => setAnalyzedConversationData(null)}
          className="overflow-y-scroll 2xl:min-w-md space-grotesk-font"
        >
          <SheetHeader>
            <SheetTitle className="2xl:text-2xl max-2xl:text-xl">
              Conversation Analysis
            </SheetTitle>
            <SheetDescription>
              <h2 className="text-lg font-semibold"></h2>
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="2xl:text-base text-gray-700 dark:text-gray-200 2xl:font-medium mb-6">
                  {!isLoading &&
                    analyzedConversationData &&
                    analyzedConversationData.summary}
                </p>

                {/* Key Points */}
                <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                <div className="2xl:text-base text-gray-700 dark:text-gray-200 ">
                  <ul className="list-disc 2xl:font-medium">
                    {!isLoading &&
                      analyzedConversationData &&
                      analyzedConversationData.key_points &&
                      analyzedConversationData.key_points.map(
                        (point: string) => {
                          return (
                            <li className="pb-2">
                              <Markdown children={point}></Markdown>
                            </li>
                          );
                        }
                      )}
                  </ul>
                </div>
              </div>
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose
              onClick={() => setAnalyzedConversationData(null)}
              asChild
            >
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

function formatDate(isoString: string) {
  const date = new Date(isoString);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year} at ${hours}:${minutes}`;
}

export default Chat;
