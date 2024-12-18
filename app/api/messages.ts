import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/start";
import { startAnalysisIfNeeded, startHackIfNeeded } from "./messageProcessors";

export type Message = {
  id: string;
  from: {
    name: string;
    role: string;
  };
  content: string;
};
let id = 0;

let messages: Message[] = [];

const getMessages = createServerFn({
  method: "GET",
}).handler(async () => {
  return messages;
});

const postMessage = createServerFn({
  method: "POST",
})
  .validator((data) => data)
  .handler(async (ctx) => {
    messages.push(ctx.data);
    processMessage(ctx.data);
  });

const processMessage = (message: Message) => {
  console.log(message);
  const messageParts = message.content.split(" ", 4);
  if (messageParts.length !== 4) {
    return;
  }
  if (
    (messageParts[0].toLowerCase() === "hack" ||
      messageParts[0].toLowerCase() === "check") &&
    messageParts[2].toLowerCase() === "using"
  ) {
    const { taskId, message: analysisMessage } = startAnalysisIfNeeded(message);
    if (taskId) {
      messages.push({
        id: Math.random().toString(),
        content: analysisMessage,
        from: {
          name: "System",
          role: "system",
        },
      });
    }
    const { taskId: hackTaskId, message: hackResultMessage } =
      startHackIfNeeded(message);
    if (hackTaskId) {
      messages.push({
        id: Math.random().toString(),
        content: hackResultMessage,
        from: {
          name: "System",
          role: "system",
        },
      });
    }
  }
};

// client side
export const useMessages = () => {
  const messages = useServerFn(getMessages);
  const addMessage = useServerFn(postMessage);
  const query = useQuery({
    queryKey: ["messages"],
    queryFn: () => messages(),
    refetchInterval: 1000,
  });
  const mutation = useMutation({
    mutationFn: (message: Omit<Message, "id">) => {
      id += 1;
      return addMessage({
        data: {
          ...message,
          id: id.toString(),
        },
      });
    },
    onSuccess: () => {
      query.refetch();
    },
  });
  return { messages: query.data ?? [], addMessage: mutation.mutate };
};
