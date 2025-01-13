import { useMessages } from "../api/messages";
import { createFileRoute } from "@tanstack/react-router";
import { TasksPanel } from "../TasksPanel";
import { useTasks } from "../api/tasks";
import { useRef, useState } from "react";

export const Route = createFileRoute("/player")({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const [username, setUsername] = useState("John");
  const targetInputRef = useRef<HTMLInputElement>(null);
  const algorithmInputRef = useRef<HTMLSelectElement>(null);
  const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const message = e.currentTarget.value;
      addMessage({
        fromName: username,
        fromRole: "user",
        content: message,
      });
      e.currentTarget.value = "";
    }
  };
  const onSupportClick = () => {
    supportMessages.forEach((message) => {
      addMessage(message);
    });
  };
  const { tasks } = useTasks();

  const onCheckClick = () => {
    const target = targetInputRef.current?.value;
    const algorithm = algorithmInputRef.current?.value;
    if (!target || !algorithm) {
      return;
    }
    addMessage({
      fromName: username,
      fromRole: "system",
      content: `CHECK ${target} using ${algorithm}`,
    });
  };
  const onHackClick = () => {
    const target = targetInputRef.current?.value;
    const algorithm = algorithmInputRef.current?.value;
    if (!target || !algorithm) {
      return;
    }
    addMessage({
      fromName: username,
      fromRole: "system",
      content: `HACK ${target} using ${algorithm}`,
    });
  };

  return (
    <div className="text-[#00ff00] bg-gray-200 flex w-full h-[100vh] font-mono">
      <div className="flex flex-col justify-between w-[60%] h-[80%] bg-black">
        <div className="text-[#00ff00] bg-avocado-600">Spaceship Hacker</div>
        <div className="text-[#00ff00] flex flex-col grow relative">
          <button className="absolute top-0 right-0 p-2 m-1 rounded-md text-white bg-[#2d2d2d] cursor-pointer">
            clear
          </button>
          {messages.map((message, idx) => (
            <div key={idx} className="flex gap-2">
              <div>{message.fromName}:</div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        <input
          type="text"
          className="rounded-md p-2 border-top border-2 border-white"
          onKeyDown={handleEnterClick}
        />
        <div className="text-[#00ff00] bg-avocado-600 flex p-4 gap-2">
          <input
            type="text"
            className="rounded-md p-2 bg-black cursor-pointer"
            placeholder="target"
            ref={targetInputRef}
          />
          <select
            className="rounded-md p-2 bg-black cursor-pointer"
            ref={algorithmInputRef}
          >
            <option value="alpha">Alpha</option>
            <option value="beta">Beta</option>
            <option value="gamma">Gamma</option>
            <option value="delta">Delta</option>
          </select>
          <button
            className="rounded-md p-2 bg-black cursor-pointer"
            onClick={onCheckClick}
          >
            CHECK
          </button>
          <div className="grow">
            <button
              className="rounded-md p-2 bg-black cursor-pointer border-[#00ff00] border-2"
              onClick={onHackClick}
            >
              HACK
            </button>
          </div>

          <button
            className="rounded-md p-2 bg-black cursor-pointer"
            onClick={onSupportClick}
          >
            SUPPORT
          </button>
          <button className="rounded-md p-2 bg-black cursor-pointer">
            SETTINGS
          </button>
        </div>
      </div>
      {tasks && (
        <div className="grow bg-stone-800">
          <TasksPanel master={false} tasks={tasks} />
        </div>
      )}
    </div>
  );
}

const supportMessages = [
  {
    fromName: "System",
    fromRole: "system",
    content: "alpha - probablity - X time y",
  },
  {
    fromName: "System",
    fromRole: "system",
    content: "beta - probablity - Xx time yyy",
  },
  {
    fromName: "System",
    fromRole: "system",
    content: "gamma - probablity - Xxxx time yyyy",
  },
  {
    fromName: "System",
    fromRole: "system",
    content: "delta - probablity - xX time yyyyy",
  },
];
