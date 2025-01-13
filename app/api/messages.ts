import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/start";
import { startAnalysisIfNeeded, startHackIfNeeded } from "./messageProcessors";
import { getDb } from "../db/core";
import { messages, type Message, type NewMessage } from "../db/schema";
import { desc, isNull } from "drizzle-orm";

const createMessageInDb = async (newMessage: NewMessage) => {
  const [message] = await getDb()
    .insert(messages)
    .values({ ...newMessage, id: crypto.randomUUID(), createdAt: new Date() })
    .returning();

  return message;
};

// Get messages that haven't been cleared
const getMessages = createServerFn({
  method: "GET",
}).handler(async () => {
  return await getDb()
    .select()
    .from(messages)
    .where(isNull(messages.clearedAt))
    .limit(20)
    .orderBy(desc(messages.createdAt));
});

const createMessage = createServerFn({
  method: "POST",
})
  .validator((data: NewMessage) => data)
  .handler(async (ctx) => {
    const message = await createMessageInDb(ctx.data);
    await processMessage(message);
  });

const processMessage = async (message: Message) => {
  const messageParts = message.content.split(" ", 4);
  if (messageParts.length !== 4) {
    return;
  }
  if (
    (messageParts[0].toLowerCase() === "hack" ||
      messageParts[0].toLowerCase() === "check") &&
    messageParts[2].toLowerCase() === "using"
  ) {
    const { taskId, message: analysisMessage } =
      await startAnalysisIfNeeded(message);
    if (taskId) {
      await createMessageInDb({
        fromName: "System",
        fromRole: "system",
        content: analysisMessage,
      });
    }

    const { taskId: hackTaskId, message: hackResultMessage } =
      await startHackIfNeeded(message);
    if (hackTaskId) {
      await createMessageInDb({
        fromName: "System",
        fromRole: "system",
        content: hackResultMessage ?? "",
      });
    }
  }
};

// client side
export const useMessages = () => {
  const messages = useServerFn(getMessages);
  const addMessage = useServerFn(createMessage);
  const query = useQuery({
    queryKey: ["messages"],
    queryFn: () => messages(),
    refetchInterval: 1000,
  });

  const mutation = useMutation({
    mutationFn: (message: NewMessage) => {
      return addMessage({ data: message });
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const toDisplay = query.data ? [...query.data].reverse() : [];

  return { messages: toDisplay, addMessage: mutation.mutate };
};
