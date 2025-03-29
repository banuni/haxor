import { useMessages } from '../api/messages';
import { createFileRoute } from '@tanstack/react-router';
import { TasksPanel } from '../components/PlayerTasksPanel';
import { useTasks } from '../api/tasks';
import { useEffect, useRef, useState } from 'react';
import { getAnalysisMessage } from '../api/content/messageTemplates';
import { RoundButton } from '../components/ui/round-button';
import { Textarea } from '../components/ui/textarea';
import { useSessionData } from '../api/sessionData';

export const Route = createFileRoute('/player')({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const { createTask } = useTasks();
  const { getSessionDataQuery } = useSessionData();
  const username = getSessionDataQuery.data?.username ?? 'user';
  const systemLevel = getSessionDataQuery.data?.systemLevel ?? 'basic';
  const targetInputRef = useRef<HTMLInputElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);
  const algorithmInputRef = useRef<HTMLSelectElement>(null);
  // const [historyCount, setHistoryCount] = useState(0);

  const handleEnterClick = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ((e.key === 'ArrowUp' && historyCount > 0) || e.currentTarget.value === '') {
    //   e.preventDefault();
    //   setHistoryCount((historyCount) => historyCount + 1);
    //   return;
    // }
    // setHistoryCount(0);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = e.currentTarget.value;
      addMessage({
        fromName: username,
        fromRole: 'user',
        content: message,
      });
      e.currentTarget.value = '';
    }
  };
  useEffect(() => {
    // refetch username if we got new messages
    getSessionDataQuery.refetch();
  }, [messages]);
  const onSupportClick = () => {
    supportMessages.forEach((message) => {
      addMessage(message);
    });
  };
  const { tasks } = useTasks();

  const onCheckClick = () => {
    const target = targetInputRef.current?.value;
    const algorithm = algorithmInputRef.current?.value;
    const goal = goalInputRef.current?.value;
    if (!target || !algorithm || !goal) {
      return;
    }
    addMessage({
      fromName: username,
      fromRole: 'system',
      content: `CHECK: ${goal} - ${target} using ${algorithm}`,
    });
    createTask({
      description: getAnalysisMessage(target, algorithm),
      taskType: 'disable',
      status: 'analyzing',
      goal,
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
          <div className="text-[#00ff00] border-[#00ff00] border-dotted border-b">
            {`Cyber System ${systemLevelToTitle[systemLevel]} - ${username}`}
          </div>
        </div>
        <div className="text-[#00ff00] flex flex-col-reverse grow relative overflow-y-scroll">
          {messages.reverse().map((message, idx) => (
            <div key={idx} className="flex gap-2 whitespace-pre-wrap">
              <div>{message.fromName}:</div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        <Textarea
          className="rounded-md p-2 border-top border-2 border-white bg-black"
          onKeyDown={handleEnterClick}
          placeholder="Enter your message"
        />
        <div className="text-[#00ff00] bg-gray-500 flex p-4 gap-2 ">
          <input type="text" className="rounded-md p-2 bg-black cursor-pointer" placeholder="target" ref={targetInputRef} />
          <input type="text" className="rounded-md p-2 bg-black cursor-pointer" placeholder="goal" ref={goalInputRef} />
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
        </div>
        <div className="flex gap-2 p-4">
          <RoundButton text="Stealth" state="ready" />
          {/* <RoundButton text="Another thing" state="active" /> */}
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

const systemLevelToTitle = {
  basic: 'Mark I',
  pro: 'Mark II Pro',
  premium: 'Mark III Premium',
};
