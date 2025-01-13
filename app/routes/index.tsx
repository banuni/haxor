import { createFileRoute } from "@tanstack/react-router";
import "../styles/globals.css"

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div style={{ backgroundColor: "black", height: "555px" }}>
      <span>Hello "/"!</span>
    </div>
  );
}
