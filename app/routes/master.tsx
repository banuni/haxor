import { createFileRoute } from '@tanstack/react-router';
import { clearAllMessages, useMessages } from '../api/messages';
import { useTasks } from '../api/tasks';
import { MasterTaskCard } from '../components/MasterTask';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { SimpleConfirmButton } from '../components/ui/simple-confirm-button';
import { buildMessagesString } from '../lib/build-messages-string';
import copy from 'copy-to-clipboard';
import { toast } from 'sonner';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { useSessionUser } from '../api/sessionUser';
export const Route = createFileRoute('/master')({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const [fromEditable, setFromEditable] = useState(false);
  const { getUserNameQuery, setUserNameMutation } = useSessionUser({
    onChange: (newName) =>
      addMessage({
        fromName: 'System',
        fromRole: 'system',
        content: `User **${newName}** detected, welcome!`,
      }),
  });
  const username = getUserNameQuery.data ?? '...';
  const [systemLevel, setSystemLevel] = useState<'basic' | 'pro' | 'premium'>('basic');
  const [from, setFrom] = useState('System');
  const { tasks } = useTasks({ showAborted: true });

  const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addMessage({
        fromName: from,
        fromRole: 'master',
        content: e.currentTarget.value,
      });
      e.currentTarget.value = '';
    }
  };
  const onCopyAll = () => {
    copy(buildMessagesString(messages));
    toast.success('Copied {} clipboard');
  };
  return (
    <div className="bg-blue-900 flex h-[100vh] text-white gap-5 w-full">
      <div className="flex flex-col justify-between w-[60%]">
        <div className="text-2xl bg-black p-2 flex justify-between">
          <div>Chat</div>
          <div className="flex gap-2">
            <Button onClick={onCopyAll}>Copy All</Button>
            <SimpleConfirmButton onConfirm={clearAllMessages}>Clear All</SimpleConfirmButton>
            <UserSettingsModal
              username={username}
              setUsername={(newName) =>
                setUserNameMutation({
                  data: newName,
                })
              }
              systemLevel={systemLevel}
              setSystemLevel={setSystemLevel}
            />
          </div>
        </div>
        <div className="flex flex-col grow bg-eggplant-100">
          {messages.map((message, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="text-eggplant-600">{message.fromName}:</div>
              <div className="text-white">{message.content}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 text-black items-center">
          {fromEditable ? (
            <>
              <input value={from} onChange={(e) => setFrom(e.target.value)} className="text-black bg-stone-400 border rounded-md p-2  w-32" />
              <Button onClick={() => setFromEditable(false)}>Set</Button>
            </>
          ) : (
            <span onClick={() => setFromEditable(true)}>from: {from}</span>
          )}
          <input type="text" className="text-black bg-stone-400 border rounded-md p-2  grow" onKeyDown={handleEnterClick} />
        </div>
      </div>
      <div className="flex flex-col gap-2 border-red-900 border-2 rounded p-2">{tasks?.map((task) => <MasterTaskCard task={task} />)}</div>
    </div>
  );
}
