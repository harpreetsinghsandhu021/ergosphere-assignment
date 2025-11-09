import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import Input from "./input";
import { useNavigate, useParams } from "react-router";
import LineLoader from "./loader";
import { useChatStore } from "../../store/chatStore";

const Messages = ({ share }: { share: boolean }) => {
  const params = useParams();
  const navigate = useNavigate();
  const currentConvoId = params.id || null;
  const messages = useChatStore((state: any) => state.messages);
  const setCurrentConversation = useChatStore(
    (state: any) => state.setCurrentConversation
  );
  const sendMessage = useChatStore((state: any) => state.sendMessage);
  const [input, setInput] = useState<string>("");

  const isLoading = useChatStore((state: any) => state.isLoading);
  const endElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endElRef.current) {
      if (!share) {
        endElRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  useEffect(() => {
    setCurrentConversation(currentConvoId);
  }, [currentConvoId]);

  return (
    <>
      {/* {isLoading && <LineLoader />} */}
      <div className="message--content">
        {messages.map((message: any, index: number) => {
          const isUser = message.sender === "user";
          return (
            <div
              key={index}
              className={`${
                isUser
                  ? "bg-black dark:bg-purple-600 text-right text-white rounded-br-2xl rounded-bl-2xl rounded-tl-2xl rounded-tr-xs ml-auto"
                  : "text-left"
              }  my-4 p-3 max-w-max`}
            >
              <Markdown
                children={message.content}
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        PreTag="div"
                        // style={dark}
                        children={String(children).replace(/\n$/, "")}
                        language={match[1]}
                      />
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              ></Markdown>
            </div>
          );
        })}

        <div ref={endElRef}></div>
      </div>
      {isLoading && (
        <div role="status" className="max-w-2xl animate-pulse mb-8">
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5 2-80"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {!share && (
        <div
          className={`w-full max-w-3xl rounded-xl ${
            currentConvoId === null ? "" : "fixed bottom-2"
          }  bg-white`}
        >
          <Input
            onClick={async () => {
              const newId = await sendMessage(input, setInput);

              if (newId) {
                setTimeout(() => {
                  navigate(`/${newId}`);
                }, 100);
              }
            }}
            input={input}
            setInput={setInput}
          />
        </div>
      )}
    </>
  );
};

export default Messages;
