import { createFileRoute } from "@tanstack/react-router";
import { useMessages } from "../api/messages";
import { useTasks } from "../api/tasks";

export const Route = createFileRoute("/master")({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const { tasks, resolveAnalysis } = useTasks();

  const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addMessage({
        from: { name: "Master", role: "master" },
        content: e.currentTarget.value,
      });
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="bg-blue-900 flex w-full h-[100vh] text-white gap-5">
      <div className="flex flex-col justify-between">
        <div>Master Hacker</div>
        <div className="flex flex-col grow bg-eggplant-100">
          {messages.map((message, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="text-eggplant-600">{message.from.name}:</div>
              <div className="text-white">{message.content}</div>
            </div>
          ))}
        </div>
        <input
          type="text"
          className="bg-eggplant-100 border border-eggplant-500 rounded-md p-2 text-eggplant-600"
          onKeyDown={handleEnterClick}
        />
      </div>
      <div className="flex flex-col gap-2">
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="flex gap-2 not-last:border-b border-white pb-2"
          >
            <div className="flex flex-col gap-1">
              <div className="text-eggplant-200">Details:</div>
              <div>Target: {task.targetName}</div>
              <div>Algorithm: {task.algorithmName}</div>
              <div>Status: {task.status}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-eggplant-200">By Target</div>
              <input type="text" placeholder="ship size" />
              <input type="text" placeholder="distance" />
              <input type="text" placeholder="security level" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-eggplant-200">Manual Setting:</div>
              <input type="text" placeholder="probability" />
              <input type="text" placeholder="time to complete" />
              <button
                className="bg-eggplant-200 text-eggplant-600 rounded-md p-1 cursor-pointer"
                onClick={() => resolveAnalysis({ taskId: task.id })}
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
