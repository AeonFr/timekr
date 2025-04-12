import React, { useMemo } from "react";
import moment from "moment";
import { groupBy, sumBy } from "lodash";

interface Commit {
  commited_at: number;
  amount: number | string;
}

interface CommitHistoryGraphProps {
  commits: Commit[];
}

interface DayData {
  date: moment.Moment;
  amount: number;
  isEmpty: boolean;
}

const CommitHistoryGraph: React.FC<CommitHistoryGraphProps> = ({
  commits = [] as Commit[],
}) => {
  // Find the earliest commit date or use current date if no commits
  const startOfProject = useMemo(() => {
    if (commits.length === 0) {
      return moment();
    }

    const sortedCommits = [...commits].sort((a, b) => a.commited_at - b.commited_at);
    return moment(sortedCommits[0].commited_at);
  }, [commits]);

  // Group commits by day
  const commitsByDay = useMemo(() => {
    const grouped = groupBy(commits, (commit) =>
      moment(commit.commited_at).format('YYYY-MM-DD')
    );

    // Sum the amounts for each day
    const result: Record<string, number> = {};
    Object.entries(grouped).forEach(([day, dayCommits]) => {
      result[day] = sumBy(dayCommits, commit => Number(commit.amount));
    });

    return result;
  }, [commits]);

  // Generate data for the last 6 weeks
  const weeksData = useMemo(() => {
    const today = moment();
    const weeks: DayData[][] = [];

    // Generate 6 weeks of data
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const week: DayData[] = [];

      // For each day of the week (Monday = 1, Sunday = 7)
      for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
        // Calculate the date for this cell
        const date = moment(today)
          .subtract(weekIndex, 'weeks')
          .day(dayIndex === 7 ? 0 : dayIndex); // Convert to JS day format (0 = Sunday)

        const dateKey = date.format('YYYY-MM-DD');
        const amount = commitsByDay[dateKey] || 0;

        // Check if this date is before the project started
        const isEmpty = date.isBefore(startOfProject, 'day') ||
          date.isAfter(today, 'day');

        week.push({ date, amount, isEmpty });
      }

      weeks.push(week);
    }

    return weeks.reverse(); // Reverse so oldest week is first
  }, [commits, startOfProject, commitsByDay]);

  // Generate week labels
  const weekLabels = useMemo(() => {
    return weeksData.map(week => {
      const firstDay = week[0].date;
      const lastDay = week[6].date;
      const firstMonth = firstDay.format('MMM');
      const lastMonth = lastDay.format('MMM');

      return {
        month: firstMonth === lastMonth ? firstMonth : `${firstMonth}-${lastMonth}`,
        start: firstDay.format('DD'),
        end: lastDay.format('DD'),
      };
    });
  }, [weeksData]);

  // Calculate color intensity based on amount
  const getColorIntensity = (amount: number): string => {
    if (amount === 0) return "rgba(127,127,127,0.2)";

    // Normalize the intensity between 40% and 100%
    const intensity = Math.min(Math.max((100 / 480) * amount, 40), 100);
    return `hsla(207, 70%, 50%, ${intensity}%)`;
  };

  return (
    <svg viewBox="0 0 335 90" className="text-1">
      {/* Day labels */}
      <g style={{ fontSize: "8px", fill: "currentColor" }}>
        <text x="4" y="7">Mon.</text>
        <text x="4" y="27">Wed.</text>
        <text x="4" y="47">Fri.</text>
        <text x="4" y="67">Sun.</text>
      </g>

      {/* Week columns */}
      {weeksData.map((week, weekIndex) => (
        <g key={`week-${weekIndex}`} transform={`translate(${weekIndex * 50 + 35}, 0)`}>
          {week.map((day, dayIndex) => (
            <rect
              key={`day-${day.date.format('YYYY-MM-DD')}`}
              transform={`translate(0, ${dayIndex * 10})`}
              fill={day.isEmpty ? "rgba(127,127,127,0.1)" : getColorIntensity(day.amount)}
              width="49"
              height="9"
              aria-label={`Day ${day.date.format('YYYY-MM-DD')}`}
            />
          ))}
        </g>
      ))}

      {/* Month and date labels */}
      <g style={{ fontSize: "8px", fill: "currentColor" }}>
        {weekLabels.map((label, i) => (
          <g key={`label-${i}`}>
            <text x={35 + i * 50} y="79">{label.month}</text>
            <text x={35 + i * 50} y="89">{label.start}-{label.end}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default CommitHistoryGraph;
