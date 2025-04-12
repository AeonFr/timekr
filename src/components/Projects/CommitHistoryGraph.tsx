import React, { useMemo } from "react";
import moment from "moment";
import { mapValues, groupBy, sumBy } from "lodash";

interface Commit {
  commited_at: number;
  amount: number | string;
}

interface CommitHistoryGraphProps {
  commits: Commit[];
  startOfProject?: number;
}

interface WeekLabel {
  month: string;
  start: string;
  end: string;
}

const CommitHistoryGraph: React.FC<CommitHistoryGraphProps> = ({
  commits = [] as Commit[],
}) => {
  const startOfProject = useMemo(() => {
    if (commits.length === 0) {
      return +new Date();
    }

    const sortedCommits = commits.sort((c1, c2) => {
      if (c1.commited_at < c2.commited_at) {
        return -1;
      }
      return 1;
    });

    return sortedCommits[0].commited_at;
  }, [commits]);

  const currentWeekday = moment().isoWeekday();

  // Helper function to get index string for a timestamp
  const indStr = (timestamp: number): [number, number] => {
    const commitedAt = moment(timestamp);
    const startOfWeek = moment().startOf("week");
    const weekday = commitedAt.isoWeekday();
    const weekDiff =
      moment.duration(commitedAt.startOf("week").diff(startOfWeek)).asWeeks() -
      1;
    return [Math.abs(Math.ceil(weekDiff)), weekday];
  };

  // Computed properties as memoized values
  const commitsGrouped = useMemo(() => {
    return mapValues(
      groupBy(commits, (c) => {
        const ind = indStr(c.commited_at);
        return `${ind[0]}-${ind[1]}`;
      }),
      (gr) => {
        return sumBy(gr, (c) => Number(c.amount));
      },
    );
  }, [commits]);

  const startOfProjectIndStr = useMemo(() => {
    if (!startOfProject) return false;
    return indStr(startOfProject);
  }, [startOfProject]);

  const pastWeeksLabels = useMemo(() => {
    const result: WeekLabel[] = [];
    for (let i = 0; i <= 5; i++) {
      const startOfWeek = moment().subtract(i, "weeks").startOf("week");
      const index: WeekLabel = {
        month: startOfWeek.format("MMM"),
        start: startOfWeek.format("DD"),
        end: startOfWeek.endOf("week").format("DD"),
      };
      result.push(index);
    }
    return result;
  }, []);

  // Method to determine fill color
  const getFill = (weekDiff: number, weekday: number): string => {
    if (weekDiff === 1 && weekday < currentWeekday) {
      return "rgba(127,127,127,0)";
    }

    if (
      startOfProjectIndStr &&
      (startOfProjectIndStr[0] < weekDiff ||
        (startOfProjectIndStr[0] === weekDiff &&
          startOfProjectIndStr[1] > weekday))
    ) {
      return "rgba(127,127,127,0.1)";
    }

    const c = commitsGrouped[`${weekDiff}-${weekday}`];
    if (c) {
      return `hsla(207, 70%, 50%, ${Math.min(
        Math.max((100 / 480) * c, 40),
        100,
      )}%)`;
    } else {
      return "rgba(127,127,127,0.2)";
    }
  };

  // Generate week columns
  const weekColumns = Array.from({ length: 6 }, (_, w) => w + 1).map((w) => (
    <g key={`w-${w}`} transform={`translate(${(w - 1) * 50 + 35}, 0)`}>
      {Array.from({ length: 7 }, (_, d) => d + 1).map((d) => (
        <rect
          key={`w-${w}d-${d}`}
          transform={`translate(0, ${(d - 1) * 10})`}
          fill={getFill(w, d)}
          width="49"
          height="9"
        />
      ))}
    </g>
  ));

  return (
    <svg viewBox="0 0 335 90" className="text-1">
      {weekColumns}

      <g style={{ fontSize: "8px", fill: "currentColor" }}>
        <text x="4" y="7">
          Mon.
        </text>
        <text x="4" y="27">
          Wed.
        </text>
        <text x="4" y="47">
          Fri.
        </text>
        <text x="4" y="67">
          Sun.
        </text>

        {pastWeeksLabels.map((l, i) => (
          <g key={l.month + l.start}>
            <text x={35 + i * 50} y="79">
              {l.month}
            </text>
            <text x={35 + i * 50} y="89">
              {l.start}-{l.end > l.start ? l.end : "..."}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default CommitHistoryGraph;
