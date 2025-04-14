import React, { useMemo, useState, useEffect, useRef } from "react";
import moment from "moment";
import { groupBy, sumBy } from "lodash";
import Switch from "../Switch";

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
  const [viewType, setViewType] = useState<string>("Per day");
  const [visibleWeeks, setVisibleWeeks] = useState<number>(
    window.innerWidth < 840 ? 4 : 6,
  );
  const graphRef = useRef<HTMLDivElement>(null);
  // Find the earliest commit date or use current date if no commits
  const startOfProject = useMemo(() => {
    if (commits.length === 0) {
      return moment();
    }

    const sortedCommits = [...commits].sort(
      (a, b) => a.commited_at - b.commited_at,
    );
    return moment(sortedCommits[0].commited_at);
  }, [commits]);

  // Group commits by day
  const commitsByDay = useMemo(() => {
    const grouped = groupBy(commits, (commit) =>
      moment(commit.commited_at).format("YYYY-MM-DD"),
    );

    // Sum the amounts for each day
    const result: Record<string, number> = {};
    Object.entries(grouped).forEach(([day, dayCommits]) => {
      result[day] = sumBy(dayCommits, (commit) => Number(commit.amount));
    });

    return result;
  }, [commits]);

  // Update visible weeks based on screen width using matchMedia
  useEffect(() => {
    // Create media query for screens less than 840px
    const mediaQuery = window.matchMedia("(max-width: 840px)");
    
    // Handler function that updates visible weeks based on media query state
    const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setVisibleWeeks(e.matches ? 4 : 6);
    };
    
    // Initial check
    handleMediaQueryChange(mediaQuery);
    
    // Modern event listener approach
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaQueryChange);
      return () => {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
      };
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleMediaQueryChange);
      return () => {
        mediaQuery.removeListener(handleMediaQueryChange);
      };
    }
  }, []);

  // Generate data for the last N weeks
  const weeksData = useMemo(() => {
    const today = moment();
    const weeks: DayData[][] = [];

    // Generate N weeks of data
    for (let weekIndex = 0; weekIndex < visibleWeeks; weekIndex++) {
      const week: DayData[] = [];

      // For each day of the week (Sunday = 0, Saturday = 6)
      for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
        // Calculate the date for this cell
        const date = moment(today).subtract(weekIndex, "weeks").day(dayIndex);

        const dateKey = date.format("YYYY-MM-DD");
        const amount = commitsByDay[dateKey] || 0;

        // Check if this date is before the project started
        const isEmpty =
          date.isBefore(startOfProject, "day") || date.isAfter(today, "day");

        week.push({ date, amount, isEmpty });
      }

      weeks.push(week);
    }

    return weeks.reverse(); // Reverse so oldest week is first
  }, [commits, startOfProject, commitsByDay]);

  // Generate week labels
  const weekLabels = useMemo(() => {
    return weeksData.map((week) => {
      const firstDay = week[0].date;
      const lastDay = week[6].date;
      const firstMonth = firstDay.format("MMM");
      const lastMonth = lastDay.format("MMM");

      return {
        month:
          firstMonth === lastMonth ? firstMonth : `${firstMonth}-${lastMonth}`,
        start: firstDay.format("DD"),
        end: lastDay.format("DD"),
      };
    });
  }, [weeksData]);

  const [lowestAmount, highestAmount] = useMemo(() => {
    const sorted = commits.sort((c1, c2) => {
      if (c1.amount < c2.amount) {
        return -1;
      }
      return 1;
    });
    return [sorted[0]?.amount || 0, sorted.at(-1)?.amount || 40];
  }, [commits]);

  // Calculate color intensity based on amount
  const getColorIntensity = (amount: number): string => {
    if (amount === 0) return "rgba(127,127,127,0.1)";
    // Calculate the intensity based on linear interpolation
    let intensity =
      40 + ((amount - lowestAmount) * 60) / (highestAmount - lowestAmount);

    // Clamp intensity to be between 40 and 100
    intensity = Math.min(100, Math.max(40, intensity));

    return `hsla(207, 70%, 50%, ${intensity}%)`;
  };

  // Calculate cumulative time data for the line graph
  const cumulativeTimeData = useMemo(() => {
    // Create an array of daily totals for each week
    const dailyTotals: number[] = [];

    // Flatten the weeks data and calculate daily totals
    weeksData.forEach((week) => {
      week.forEach((day) => {
        dailyTotals.push(day.amount);
      });
    });

    // Calculate cumulative totals
    const cumulativeTotals: number[] = [];
    let runningTotal = 0;

    dailyTotals.forEach((amount) => {
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

  // Calculate the SVG viewBox based on visible weeks
  const svgViewBox = useMemo(() => {
    const width = 35 + visibleWeeks * 50;
    return viewType === "Per day" ? `0 0 ${width} 90` : `30 0 ${width + 10} 90`;
  }, [visibleWeeks, viewType]);

  // State for animated viewBox
  const [animatedViewBox, setAnimatedViewBox] = useState(svgViewBox);

  // Update viewBox with animation when viewType or visibleWeeks changes
  useEffect(() => {
    if (viewType === "Per day") {
      // Animate from line graph to per day view
      const startTime = Date.now();
      const duration = 300; // 300ms animation
      const baseWidth = 35 + visibleWeeks * 50;
      const startValue = 30;
      const endValue = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out function
        const easeProgress = 1 - Math.pow(1 - progress, 2);

        const currentX = startValue - (startValue - endValue) * easeProgress;
        const currentWidth =
          baseWidth + 10 - (baseWidth + 10 - baseWidth) * easeProgress;

        setAnimatedViewBox(`${currentX} 0 ${currentWidth} 90`);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      // Animate from per day to line graph view
      const startTime = Date.now();
      const duration = 300; // 300ms animation
      const baseWidth = 35 + visibleWeeks * 50;
      const startValue = 0;
      const endValue = 30;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out function
        const easeProgress = 1 - Math.pow(1 - progress, 2);

        const currentX = startValue + (endValue - startValue) * easeProgress;
        const currentWidth =
          baseWidth + (baseWidth + 10 - baseWidth) * easeProgress;

        setAnimatedViewBox(`${currentX} 0 ${currentWidth} 90`);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [viewType, visibleWeeks, svgViewBox]);

  return (
    <div aria-hidden ref={graphRef}>
      <div className="flex justify-end items-center mb-2">
        <span className="text-xs text-grey-darker mr-2">Graph: </span>
        <Switch
          options={["Per day", "Line graph"]}
          value={viewType}
          onChange={setViewType}
        />
      </div>
      <svg
        viewBox={animatedViewBox}
        className="text-1 cursor-default"
        style={{ height: "142px", width: "100%" }}
      >
        {/* Day labels */}
        <g style={{ fontSize: "8px", fill: "currentColor" }}>
          <text x="4" y="17">
            Mon
          </text>
          <text x="4" y="37">
            Wed
          </text>
          <text x="4" y="57">
            Fri
          </text>
        </g>

        {/* Week columns */}
        <g
          style={{
            opacity: viewType === "Per day" ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {weeksData.map((week, weekIndex) => (
            <g
              key={`week-${weekIndex}`}
              transform={`translate(${weekIndex * 50 + 35}, 0)`}
            >
              {week.map((day, dayIndex) => (
                <rect
                  key={`day-${day.date.format("YYYY-MM-DD")}`}
                  transform={`translate(0, ${dayIndex * 10})`}
                  fill={
                    day.isEmpty
                      ? "rgba(127,127,127,0.06)"
                      : getColorIntensity(day.amount)
                  }
                  width="49"
                  height="9"
                  aria-label={`Day ${day.date.format("YYYY-MM-DD")}`}
                />
              ))}
            </g>
          ))}
        </g>

        {/* Line graph for cumulative time */}
        {cumulativeTimeData.points.length > 1 && (
          <g
            style={{
              opacity: viewType === "Line graph" ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            {/* Line path */}
            <path
              d={`M${cumulativeTimeData.points.map((point) => `${point[0]},${point[1]}`).join(" L")}`}
              fill="none"
              stroke="hsla(207, 70%, 50%, 100%)"
              strokeWidth="1.5"
            />
            {/* Y-axis labels (right side) */}
            <g style={{ fontSize: "8px", fill: "hsla(207, 70%, 50%, 100%)" }}>
              <text x="336" y="14" textAnchor="start">
                {Math.round(cumulativeTimeData.maxTotal)}min
              </text>
              <text x="336" y="44" textAnchor="start">
                {Math.round(cumulativeTimeData.maxTotal / 2)}min
              </text>
              <text x="336" y="74" textAnchor="start">
                0 min
              </text>
            </g>
          </g>
        )}

        {/* Month and date labels */}
        <g style={{ fontSize: "8px", fill: "currentColor" }}>
          {weekLabels.map((label, i) => (
            <g key={`label-${i}`}>
              <text x={35 + i * 50} y="79">
                {label.month}
              </text>
              <text x={35 + i * 50} y="89">
                {label.start}-{label.end}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CommitHistoryGraph;
