import { createTask, getTaskByTargetAndAlgorithm } from "./tasks";
import type { Message } from "./messages";

export function startAnalysisIfNeeded(message: Message) {
  const messageParts = message.content.split(" ", 4);
  if (messageParts.length !== 4) {
    return { taskId: null, message: null };
  }
  if (messageParts[0].toLowerCase() !== "check") {
    return { taskId: null, message: null };
  }
  const targetName = messageParts[1];
  const algorithmName = messageParts[3];

  const description = `Analyzing - target: ${targetName} algorithm: ${algorithmName}`;
  const taskId = Math.random().toString();
  createTask({
    data: {
      id: taskId,
      description,
      status: "analyzing",
      startedAt: null,
      targetName,
      algorithmName,
    },
  });
  return { taskId, message: description };
}

export function startHackIfNeeded(message: Message) {
  const messageParts = message.content.split(" ", 4);
  if (messageParts.length !== 4) {
    return { taskId: null, message: null };
  }
  const targetName = messageParts[1];
  const algorithmName = messageParts[3];
  const task = getTaskByTargetAndAlgorithm(targetName, algorithmName);
  if (!task) {
    return { taskId: null, message: null };
  }
  return {
    taskId: task.id,
    message: `Hacking ${targetName} using ${algorithmName} - will take ${task.estimatedSecondsToComplete} seconds`,
  };
}
