import { SidebarProvider } from "./components/ui/sidebar";

import "./App.css";

import { Routes, Route } from "react-router";
import Home from "./pages/home";
import Chat from "./pages/chat";
import Search from "./pages/search";
import { ThemeProvider } from "./components/ui/themeProvider";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:id" element={<Chat share={false} />} />
            <Route path="/share/:id" element={<Chat share={true} />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
