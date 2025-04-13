import { sortBy, random } from "lodash";
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
  const startOfWeek = moment().startOf('week');
  const commits: Commit[] = [];
  
  // Generate random commits for the past 14 days
  for (let i = 0; i < 14; i++) {
    const day = moment(startOfWeek).subtract(i, 'days');
    
    // Add 0-3 commits per day with random times
    const commitsPerDay = random(0, 3);
    for (let j = 0; j < commitsPerDay; j++) {
      // Random time between 9am and 6pm
      const hour = random(9, 18);
      const minute = random(0, 59);
      const commitTime = moment(day).hour(hour).minute(minute);
      
      // Random amount between 15 and 120 minutes
      const amount = random(15, 120);
      
      commits.push({
        commited_at: +commitTime,
        amount: amount
      });
    }
  }
  
  // Sort commits by date (newest first)
  const sortedCommits = sortBy(commits, ['commited_at']).reverse();
  
  // Calculate total time
  const totalTime = commits.reduce((sum, commit) => sum + Number(commit.amount), 0);
  
  return {
    "Sample Project": {
      name: "Sample Project",
      time: totalTime,
      commits: sortedCommits,
      created_at: +moment().subtract(14, 'days'),
      updated_at: +new Date(),
      time_budget: 2000,
      deadline: +moment().add(14, 'days')
    }
  };
};
