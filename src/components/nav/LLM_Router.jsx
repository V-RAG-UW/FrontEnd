import { BrowserRouter, Route, Routes } from "react-router-dom";

import RAG_Deez from "../LLM_Front";
import Homepage from "./pages/Homepage"
import AboutUs from "./pages/AboutUs"
import NotFound from "./pages/NotFound"

export default function LLM_Router() {
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<RAG_Deez />}>
                <Route index element={<Homepage />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    </BrowserRouter>
}