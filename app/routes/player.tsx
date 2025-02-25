import { useMessages } from '../api/messages';
import { createFileRoute } from '@tanstack/react-router';
import { TasksPanel } from '../components/PlayerTasksPanel';
import { useTasks } from '../api/tasks';
import { useRef, useState } from 'react';
import { getAnalysisMessage } from '../api/content/messageTemplates';
import { UserSettingsModal } from '../components/UserSettingsModal';
import { RoundButton } from '../components/ui/round-button';

export const Route = createFileRoute('/player')({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const { createTask } = useTasks();
  const [username, setUsername] = useState('user');
  const [systemLevel, setSystemLevel] = useState<'basic' | 'pro' | 'premium'>('basic');
  const targetInputRef = useRef<HTMLInputElement>(null);
  const algorithmInputRef = useRef<HTMLSelectElement>(null);
  const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const message = e.currentTarget.value;
      addMessage({
        fromName: username,
        fromRole: 'user',
        content: message,
      });
      e.currentTarget.value = '';
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
      fromRole: 'system',
      content: `CHECK ${target} using ${algorithm}`,
    });
    createTask({
      description: getAnalysisMessage(target, algorithm),
      taskType: 'disable',
      status: 'analyzing',
      startedAt: null,
      targetName: target,
      algorithmName: algorithm,
    });
    setTimeout(() => {
      addMessage({
        fromName: 'System',
        fromRole: 'system',
        content: getAnalysisMessage(target, algorithm),
      });
    }, 1000);
    targetInputRef.current!.value = '';
  };

  return (
    <div className="text-[#00ff00] bg-gray-200 flex w-full h-[100vh] font-mono">
      <div className="flex flex-col justify-between w-[60%] bg-black">
        <div className="flex justify-between">
          <div className="text-[#00ff00] bg-avocado-600">Spaceship Hacker</div>
          <UserSettingsModal username={username} setUsername={setUsername} systemLevel={systemLevel} setSystemLevel={setSystemLevel} />
        </div>
        <div className="text-[#00ff00] flex flex-col grow relative">
          {messages.map((message, idx) => (
            <div key={idx} className="flex gap-2">
              <div>{message.fromName}:</div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        <input type="text" className="rounded-md p-2 border-top border-2 border-white bg-black" onKeyDown={handleEnterClick} />
        <div className="text-[#00ff00] bg-gray-500 flex p-4 gap-2 ">
          <input type="text" className="rounded-md p-2 bg-black cursor-pointer" placeholder="target" ref={targetInputRef} />
          <select className="rounded-md p-2 bg-black cursor-pointer" ref={algorithmInputRef}>
            <option value="alpha">Alpha</option>
            <option value="beta">Beta</option>
            <option value="gamma">Gamma</option>
            <option value="delta">Delta</option>
          </select>
          <button className="rounded-md p-2 bg-black cursor-pointer border-[#00ff00] border-2" onClick={onCheckClick}>
            Send to Analysis
          </button>

          <button className="rounded-md p-2 bg-black cursor-pointer" onClick={onSupportClick}>
            SUPPORT
          </button>
          <button className="rounded-md p-2 bg-black cursor-pointer">SETTINGS</button>
        </div>
        <div className="flex gap-2 p-4">
          <RoundButton text="Stealth" state="ready" />
          <RoundButton text="Another thing" state="active" />
        </div>
      </div>
      {tasks && (
        <div className="grow bg-stone-800">
          <TasksPanel tasks={tasks} username={username} />
        </div>
      )}
    </div>
  );
}

const supportMessages = [
  {
    fromName: 'System',
    fromRole: 'system',
    content: 'alpha - probability - X time y',
  },
  {
    fromName: 'System',
    fromRole: 'system',
    content: 'beta - probability - Xx time yyy',
  },
  {
    fromName: 'System',
    fromRole: 'system',
    content: 'gamma - probability - Xxxx time yyyy',
  },
  {
    fromName: 'System',
    fromRole: 'system',
    content: 'delta - probability - xX time yyyyy',
  },
];
