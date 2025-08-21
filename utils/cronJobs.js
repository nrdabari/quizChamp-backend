const cron = require("node-cron");
const StudentTask = require("../models/StudentTask");

// Run daily at midnight to handle carryovers and revisions
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily task management jobs...");

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // 1. Handle carryover tasks
    const incompleteTasks = await StudentTask.find({
      assignedDate: {
        $gte: yesterday,
        $lte: endOfYesterday,
      },
      status: { $in: ["assigned", "in_progress"] },
    });

    // Create carryover tasks for today
    for (let task of incompleteTasks) {
      await StudentTask.create({
        studentId: task.studentId,
        taskId: task.taskId,
        assignedDate: new Date(),
        dueDate: new Date(),
        customDuration: task.customDuration,
        priority: "urgent",
        source: "carryover",
        timer: {
          state: "stopped",
          timeRemaining: task.customDuration || task.timer.timeRemaining,
          totalTimeSpent: 0,
        },
      });

      // Mark original as carried over
      task.status = "carried_over";
      await task.save();
    }

    // 2. Handle due revisions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const dueRevisions = await StudentTask.find({
      "revision.nextRevisionDate": {
        $gte: today,
        $lte: endOfToday,
      },
    }).populate("taskId");

    // Create revision tasks
    for (let originalTask of dueRevisions) {
      const nextRevision = originalTask.revision.scheduledRevisions.find(
        (r) => !r.completed
      );

      if (nextRevision) {
        await StudentTask.create({
          studentId: originalTask.studentId,
          taskId: originalTask.taskId,
          assignedDate: new Date(),
          dueDate: new Date(),
          customDuration: originalTask.customDuration,
          priority: "high",
          source: "revision",
          revision: {
            isRevision: true,
            originalTaskId: originalTask._id,
            originalCompletionDate: originalTask.completedAt,
            revisionNumber: nextRevision.revisionNumber,
          },
          timer: {
            state: "stopped",
            timeRemaining: originalTask.customDuration,
            totalTimeSpent: 0,
          },
        });
      }
    }

    console.log("Daily task management completed successfully");
  } catch (error) {
    console.error("Daily task management error:", error);
  }
});
