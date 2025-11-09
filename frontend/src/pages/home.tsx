import { AppSidebar } from "../components/navigation/appSidebar";
import Messages from "../components/chat/messages";
import { useChatStore } from "../store/chatStore";

const Home = () => {
  const isLoading = useChatStore((state: any) => state.isLoading);
  return (
    <>
      <AppSidebar />

      <div className=" w-full flex flex-col items-center justify-center">
        {!isLoading && (
          <h1 className="2xl:text-6xl max-2xl:text-4xl pb-8 bg-linear-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
            Scribe:{" "}
            <span className="2xl:text-4xl max-2xl:text-2xl">
              {" "}
              Your conversational second brain.
            </span>
          </h1>
        )}
        <Messages />
      </div>
    </>
  );
};

export default Home;
