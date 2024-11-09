import { Outlet } from "react-router-dom";
import LLMNavbar from './nav/LLMNavbar';

export default function LLMFront() {
  return <div>
    <LLMNavbar />
    <div style={{ margin: "1rem" }}>
      <Outlet />
    </div>
  </div>
}