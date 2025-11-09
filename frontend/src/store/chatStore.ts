import type { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

// This is our central, global store for the entire chat application.
// It will handle all state and all API interactions.

const API_URL = "http://127.0.0.1:8000/api";

export const useChatStore = create((set, get: any) => ({
  conversations: [],
  currentConversationId: null,
  currentConversation: null,
  messages: [],
  searchResults: [],
  isLoading: false,
  isSidebarLoading: false,

  /**
   * Fetches the list of all conversations from the backend.
   */
  fetchConversations: async () => {
    set({ isSidebarLoading: true });
    try {
      const response = await fetch("http://127.0.0.1:8000/api/conversations/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set({
        conversations: data,
        searchResults: data,
        isSidebarLoading: false,
      }); // Update our state with the data from the backend
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      set({ isSidebarLoading: false });
    }
  },

  /**
   * Fetches a single conversation's full history and sets it as active.
   * This is called when a user clicks on a chat in the sidebar.
   * @param id current conversation ID
   * @returns
   */
  setCurrentConversation: async (id: number) => {
    // Don't re-fetch if it's already the active chat
    if (get().currentConversationId === id) return;

    set({ currentConversationId: id, messages: [], isLoading: true });
    try {
      const response = await fetch(`${API_URL}/conversations/${id}/`);
      const data = await response.json();
      set({
        messages: data.messages || [],
        isLoading: false,
        currentConversation: data,
      });
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      set({ isLoading: false });
    }
  },

  /**
   * Resets the state to a new, empty chat.
   * This is called by "New Chat" button
   */
  startNewChat: () => {
    set({
      currentConversationId: null,
      messages: [],
      isLoading: false,
      currentConversation: null,
    });
  },

  /**
   * This is the main action. It sends a user's message.
   * handles the streaming response, and updates the state.
   * It also handles the new chat creation and returns the new ID.
   * @param messageContent
   * @returns
   */
  sendMessage: async (
    messageContent: string,
    setInput: Dispatch<SetStateAction<string>>
  ) => {
    set({ isLoading: true });
    const isNewChat = get().currentConversationId === null;

    // 1. Optimistic UI: Add the user's message immediately
    const userMessage = {
      sender: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    // 2. Optimistic UI: Add an empty "AI" stub to stream into
    const aiMessageStub = {
      sender: "ai",
      content: "...", // Start with a "typing" indicator
      timestamp: new Date().toISOString(),
    };

    set((state: { messages: any[] }) => ({
      messages: [...state.messages, userMessage, aiMessageStub],
    }));

    const payload = {
      message: messageContent,
      conversation_id: get().currentConversationId,
    };

    setInput("");

    try {
      // 3. Start the streaming fetch call
      const response = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = "";

      set({ isLoading: false });

      // 4. Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        aiResponseContent += chunk;

        // 5. Update the *last* message in the array (the AI stub)
        // This creates the real-time "typing" effect
        set((state: { messages: any[] }) => {
          const newMessages = [...state.messages];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: aiResponseContent,
          };
          return { messages: newMessages };
        });
      }

      // 6. --- CRITICAL: Handle New Chat Creation ---
      // If this was a new chat, we need to update our state

      if (isNewChat) {
        // Re-fetch the conversation list to get the new chat
        await get().fetchConversations();

        // The API returns newest first, so the new convo is at the top
        const newConvoId = get().conversations[0]?.id;

        if (newConvoId) {
          set({ currentConversationId: newConvoId });
          // Return the new ID so the component can redirect
          return newConvoId;
        }
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      // Show the error in the UI
      set((state: { messages: any[] }) => {
        const newMessages = [...state.messages];
        newMessages[newMessages.length - 1].content =
          "Error: Could not get AI response.";
        return { messages: newMessages, isLoading: false };
      });
    }

    return null; // Return null if it wasn't a new chat
  },

  /**
   * Action to call the "analyze" component
   */
  analyzeCurrentConversation: async () => {
    const convoId = get().currentConversationId;

    if (!convoId) {
      alert("Please select a conversation to analyze.");
    }

    set({ isLoading: true });

    try {
      const response = await fetch(
        `${API_URL}/conversations/${convoId}/analyze/`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to analyze conversation");
      const data = await response.json();

      set({ isLoading: false });

      return data;
    } catch (error) {
      console.error("Error analyzing conversation:", error);
      set({ isLoading: false });
      //   alert("Error: Could not analyze conversation.");
    }
  },

  /**
   * Action to call the "search" endpoint
   */
  searchConversations: async (query: string) => {
    if (!query.trim()) {
      get().fetchConversations();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/search/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error("Search request failed");
      const data = await response.json();
      // Replace the sidebar list with the search results
      set({ searchResults: data });
    } catch (error) {
      console.error("Error searching conversations:", error);
    }
  },
}));
