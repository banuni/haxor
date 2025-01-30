import { createFileRoute } from '@tanstack/react-router';
import { useMessages } from '../api/messages';
import { useTasks } from '../api/tasks';
import { MasterTaskCard } from '../components/MasterTask';

export const Route = createFileRoute('/master')({
  component: RouteComponent,
});

function RouteComponent() {
  const { messages, addMessage } = useMessages();
  const { tasks } = useTasks({ showAborted: true });

  const handleEnterClick = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addMessage({
        fromName: 'System',
        fromRole: 'master',
        content: e.currentTarget.value,
      });
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="bg-blue-900 flex w-full h-[100vh] text-white gap-5">
      <div className="flex flex-col justify-between">
        <div>Master Hacker</div>
        <div className="flex flex-col grow bg-eggplant-100">
          {messages.map((message, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="text-eggplant-600">{message.fromName}:</div>
              <div className="text-white">{message.content}</div>
            </div>
          ))}
        </div>
        <input type="text" className="bg-eggplant-100 border border-eggplant-500 rounded-md p-2 text-eggplant-600" onKeyDown={handleEnterClick} />
      </div>
      <div className="flex flex-col gap-2 border-red-900 border-2 rounded p-2">{tasks?.map((task) => <MasterTaskCard task={task} />)}</div>
    </div>
  );
}
