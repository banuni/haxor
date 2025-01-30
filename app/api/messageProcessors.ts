import {
  createTaskInDb,
  getTaskByTargetAndAlgorithm,
  updateTaskInDb,
} from "./tasks";
import type { Message } from "../db/schema";

// export async function startAnalysisIfNeeded(message: Message) {
//   const messageParts = message.content.split(" ", 4);
//   if (messageParts.length !== 4) {
//     return { taskId: null, message: null };
//   }
//   if (messageParts[0].toLowerCase() !== "check") {
//     return { taskId: null, message: null };
//   }
//   const targetName = messageParts[1];
//   const algorithmName = messageParts[3];

//   const description = `Analyzing - target: ${targetName} algorithm: ${algorithmName}`;
  // const task = await createTaskInDb({
  //   description,
  //   taskType: "disable",
  //   status: "analyzing",
  //   startedAt: null,
  //   targetName,
  //   algorithmName,
  // });
  // return { taskId: task.id, message: description };
// }

// export async function startHackIfNeeded(message: Message) {
//   const messageParts = message.content.split(" ", 4);
//   if (messageParts.length !== 4) {
//     return { taskId: null, message: null };
//   }
//   const targetName = messageParts[1];
//   const algorithmName = messageParts[3];
//   const task = await getTaskByTargetAndAlgorithm(targetName, algorithmName);
//   if (!task || task.status !== "pending") {
//     return { taskId: null, message: null };
//   }
//   await updateTaskInDb(task.id, { status: "in-progress" });
//   return {
//     taskId: task.id,
//     message: `Hacking ${targetName} using ${algorithmName} - will take ${task.estimatedSecondsToComplete} seconds`,
//   };
// }
