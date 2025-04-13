import { sortBy } from "lodash";
import moment from "moment";

// Define interfaces for our state
interface Commit {
  commited_at: number;
  amount: number | string;
}

interface Project {
  name: string;
  time: number;
  commits: Commit[];
  created_at: number;
  updated_at: number;
  time_budget?: number | string;
  deadline?: number;
}

// Generate sample project data for demonstration
export const generateSampleProject = (): Record<string, Project> => {
  // Get the start of the current week (Monday)
  const startOfWeek = moment().startOf("week");
  const commits: Commit[] = [];

  const sampleData = [
    {
      dayDelta: -1,
      hour: 9,
      minute: 20,
      amount: 20,
    },
    {
      dayDelta: -1,
      hour: 10,
      minute: 24,
      amount: 40,
    },
    {
      dayDelta: -1,
      hour: 14,
      minute: 36,
      amount: 36,
    },
    {
      dayDelta: -2,
      hour: 16,
      minute: 30,
      amount: 120,
    },
    // ...
  ];

  for (const commitSample of sampleData) {
    const day = moment(startOfWeek).subtract(-commitSample.dayDelta, "days");

    const commitTime = moment(day)
      .hour(commitSample.hour)
      .minute(commitSample.minute);

    commits.push({
      commited_at: +commitTime,
      amount: commitSample.amount,
    });
  }

  // Sort commits by date (newest first)
  const sortedCommits = sortBy(commits, ["commited_at"]).reverse();

  // Calculate total time
  const totalTime = commits.reduce(
    (sum, commit) => sum + Number(commit.amount),
    0,
  );

  return {
    "Sample Project": {
      name: "Sample Project",
      time: totalTime,
      commits: sortedCommits,
      created_at: +moment().subtract(14, "days"),
      updated_at: +new Date(),
      time_budget: 2000,
      deadline: +moment().add(14, "days"),
    },
  };
};
