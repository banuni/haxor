import { useMutation, useQuery } from '@tanstack/react-query';
import { createServerFn, useServerFn } from '@tanstack/start';
import { getDb } from '../db/core';
import { messages, type Message, type NewMessage } from '../db/schema';
import { desc, isNull } from 'drizzle-orm';

export const createMessageInDb = async (newMessage: NewMessage) => {
  const [message] = await getDb()
    .insert(messages)
    .values({ ...newMessage, id: crypto.randomUUID(), createdAt: new Date() })
    .returning();

  return message;
};

// Get messages that haven't been cleared
const getMessages = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await getDb().select().from(messages).where(isNull(messages.clearedAt)).limit(20).orderBy(desc(messages.createdAt));
});

const createMessage = createServerFn({
  method: 'POST',
})
  .validator((data: NewMessage) => data)
  .handler(async (ctx) => {
    const message = await createMessageInDb(ctx.data);
    await processMessage(message);
  });

export const clearAllMessages = createServerFn({
  method: 'POST',
}).handler(async () => {
  await getDb().update(messages).set({ clearedAt: new Date() }).where(isNull(messages.clearedAt));
});

const processMessage = async (message: Message) => {
  // some custom logic here
  // might not be needed
};

// client side
export const useMessages = () => {
  const messages = useServerFn(getMessages);
  const addMessage = useServerFn(createMessage);
  const clearAllMessagesFn = useServerFn(clearAllMessages);
  const query = useQuery({
    queryKey: ['messages'],
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

  const clear = () => {
    clearAllMessagesFn();
    query.refetch();
  };

  const toDisplay = query.data ? [...query.data].reverse() : [];

  return { messages: toDisplay, addMessage: mutation.mutate, clear };
};
