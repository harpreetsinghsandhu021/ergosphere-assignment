import { Input } from "../components/ui/input";
import {
  AppSidebar,
  type Conversation,
} from "../components/navigation/appSidebar";
import { useChatStore } from "../store/chatStore";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";

const Search = () => {
  const { searchConversations, searchResults, fetchConversations }: any =
    useChatStore();

  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  //   --- Handle the search submission ---
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form from reloading the page

    if (query.trim() === "") {
      // If the search is empty, reset to the full list
      fetchConversations();
    } else {
      // Otherwise, call the search API
      searchConversations(query);
    }
  };

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // If the user clears the search bar, instantly reset the list
    if (newQuery.trim() === "") {
      fetchConversations();
    }
  };

  return (
    <>
      <AppSidebar />
      <div className="w-md mx-auto">
        <div className="space-grotesk-font w-full sticky top-10 bg-white dark:bg-black">
          <h1 className="text-2xl font-semibold text-left mb-4">Search</h1>
          <form onSubmit={handleSearch}>
            <Input
              value={query}
              onChange={handleQueryChange}
              placeholder="Search for chats"
              className=""
            />
          </form>
          <h5 className="text-left py-4">Recent</h5>
        </div>
        <div className="w-full">
          {searchResults.map((conv: Conversation) => (
            <Link
              to={`/${conv.id}`}
              className="py-3 border-b text-xs capitalize flex justify-between"
            >
              <p>{conv.title}</p>
              <p>{formatDate(conv.start_timestamp)}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

/**
 * Formats an ISO 8601 string (like "2025-11-05T09:17:23.641544Z")
 * into a simple "5 Nov" format.
 */
export const formatDate = (isoString: string) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const options = {
    day: "numeric",
    month: "short",
  };

  return new Intl.DateTimeFormat("en-GB", options as any).format(date);
};

export default Search;
