import React, { useMemo } from "react";
import moment from "moment";
import { groupBy, sumBy } from "lodash";

interface Commit {
  commited_at: number;
  amount: number | string;
}

interface CommitHistoryGraphProps {
  commits: Commit[];
  totalTime?: number;
}

interface DayData {
  date: moment.Moment;
  amount: number;
  isEmpty: boolean;
}

const CommitHistoryGraph: React.FC<CommitHistoryGraphProps> = ({
  commits = [] as Commit[],
  totalTime = 0,
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

      // For each day of the week (Sunday = 0, Saturday = 6)
      for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
        // Calculate the date for this cell
        const date = moment(today)
          .subtract(weekIndex, 'weeks')
          .day(dayIndex);

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
    if (amount === 0) return "rgba(127,127,127,0.1)";

    // Normalize the intensity between 40% and 100%
    const intensity = Math.min(Math.max((100 / 480) * amount, 40), 100);
    return `hsla(207, 70%, 50%, ${intensity}%)`;
  };
  
  // Calculate cumulative time data for the line graph
  const cumulativeTimeData = useMemo(() => {
    // Create an array of daily totals for each week
    const dailyTotals: number[] = [];
    
    // Flatten the weeks data and calculate daily totals
    weeksData.forEach(week => {
      week.forEach(day => {
        dailyTotals.push(day.amount);
      });
    });
    
    // Calculate cumulative totals
    const cumulativeTotals: number[] = [];
    let runningTotal = 0;
    
    dailyTotals.forEach(amount => {
      runningTotal += amount;
      cumulativeTotals.push(runningTotal);
    });
    
    // Get the maximum value for scaling
    const maxTotal = Math.max(...cumulativeTotals, totalTime);
    
    // Calculate points for the line graph (x, y coordinates)
    const points: [number, number][] = cumulativeTotals.map((total, index) => {
      const x = 35 + Math.floor(index / 7) * 50 + (index % 7) * 7;
      // Scale y value (70 is the max height of our graph area)
      const y = maxTotal > 0 ? 70 - (total / maxTotal) * 60 : 70;
      return [x, y];
    });
    
    return {
      points,
      maxTotal,
    };
  }, [weeksData, totalTime]);

  return (
    <svg viewBox="0 0 335 90" className="text-1">
      {/* Day labels */}
      <g style={{ fontSize: "8px", fill: "currentColor" }}>
        <text x="4" y="17">Mon</text>
        <text x="4" y="37">Wed</text>
        <text x="4" y="57">Fri</text>
      </g>

      {/* Week columns */}
      {weeksData.map((week, weekIndex) => (
        <g key={`week-${weekIndex}`} transform={`translate(${weekIndex * 50 + 35}, 0)`}>
          {week.map((day, dayIndex) => (
            <rect
              key={`day-${day.date.format('YYYY-MM-DD')}`}
              transform={`translate(0, ${dayIndex * 10})`}
              fill={day.isEmpty ? "rgba(127,127,127,0.06)" : getColorIntensity(day.amount)}
              width="49"
              height="9"
              aria-label={`Day ${day.date.format('YYYY-MM-DD')}`}
            />
          ))}
        </g>
      ))}
      
      {/* Line graph for cumulative time */}
      {cumulativeTimeData.points.length > 1 && (
        <>
          {/* Line path */}
          <path
            d={`M${cumulativeTimeData.points.map(point => `${point[0]},${point[1]}`).join(' L')}`}
            fill="none"
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth="1.5"
          />
          
          {/* Data points */}
          {cumulativeTimeData.points.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point[0]}
              cy={point[1]}
              r="1.5"
              fill="rgba(0, 0, 0, 0.8)"
            />
          ))}
          
          {/* Y-axis labels (right side) */}
          <g style={{ fontSize: "8px", fill: "rgba(0, 0, 0, 0.9)" }}>
            <text x="330" y="10" textAnchor="end">
              {Math.round(cumulativeTimeData.maxTotal)} min
            </text>
            <text x="330" y="40" textAnchor="end">
              {Math.round(cumulativeTimeData.maxTotal / 2)} min
            </text>
            <text x="330" y="70" textAnchor="end">
              0 min
            </text>
          </g>
        </>
      )}

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
