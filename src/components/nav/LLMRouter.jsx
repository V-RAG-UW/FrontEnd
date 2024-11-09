import { BrowserRouter, Route, Routes } from "react-router-dom";

import RAG_Deez from "../LLMFront";
import Landing from "./pages/Landing"
import AboutUs from "./pages/AboutUs"
import Chat from "./pages/Chat"
import NotFound from "./pages/NotFound"

export default function LLMRouter() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<RAG_Deez />}>
        <Route index element={<Landing />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
}