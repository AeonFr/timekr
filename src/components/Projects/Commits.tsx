import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { groupBy, sumBy } from "lodash";
import moment from "moment";
import useStore from "../../store";

import TimeInput from "../TimeInput";
import DateInput from "../DateInput";
import Icon from "../Icon";

interface Commit {
  commited_at: number;
  amount: number | string;
}

const Commits: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [editCommit, setEditCommit] = useState<
    (Commit & { editDate?: string }) | false
  >(false);

  const projects = useStore((state) => state.projects);
  const editCommitAction = useStore((state) => state.editCommit);

  const project = slug
    ? projects[slug] || { name: "", commits: [] }
    : { name: "", commits: [] };

  // Computed property converted to useMemo
  const commitsByDate = useMemo(() => {
    return groupBy(project.commits, (result) => {
      return moment(result.commited_at).startOf("day").format("LL");
    });
  }, [project.commits]);

  // Methods converted to functions
  const prettyDate = (time: number, format?: string) => {
    return moment(time).format(format === "minutes" ? "LTS" : "LL");
  };

  const twoDigits = (num: number) => {
    return (num < 0 ? "-" : "") + ("0" + Math.abs(num)).slice(-2);
  };

  const prettyTime = (amount: number | string) => {
    const numAmount = Number(amount);
    if (numAmount > 60 || numAmount < -60) {
      return (
        twoDigits(
          numAmount > 0
            ? Math.floor(numAmount / 60)
            : Math.ceil(numAmount / 60),
        ) +
        ":" +
        twoDigits(Math.abs(numAmount) % 60) +
        " hour" +
        (numAmount > 60 || numAmount < -60 ? "s" : "")
      );
    } else {
      return amount + " minute" + (amount !== 1 ? "s" : "");
    }
  };

  const totalTimeForDate = (date: string) => {
    return prettyTime(
      sumBy(commitsByDate[date], (n) => parseInt(String(n.amount))),
    );
  };

  const submitEditedCommit = () => {
    if (editCommit && slug) {
      // If date was changed, update the commited_at timestamp
      if (editCommit.editDate) {
        const newDateTime = moment(editCommit.editDate);

        // Convert to timestamp
        editCommit.new_commited_at = +newDateTime;
      }

      // Create a clean commit object without the editDate property
      const commitToSave = {
        commited_at: editCommit.commited_at,
        new_commited_at: editCommit.new_commited_at,
        amount: editCommit.amount,
      };

      editCommitAction(slug, commitToSave);
      setEditCommit(false);
    }
  };

  if (project === -1) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <section className="text-lg">
        <Link
          to={`/project/${slug}`}
          className="text-1 no-underline hover:underline"
        >
          {project.name || slug}
        </Link>
        {" > Commit History"}
      </section>

      <section className="text-left mt-4">
        <h2 className="leading-loose mb-0">Commit History</h2>
        <div className="list-reset">
          {project.commits.length === 0 ? (
            <div className="text-sm leading-normal">
              There are no commits yet. Run the pomodoro timer* or commit time
              manually to start tracking time spent in this project.
              <br />
              *Time tracked with the pomodoro timer will appear here once the
              timer gets to 0.
            </div>
          ) : (
            Object.entries(commitsByDate).map(([date, commits]) => (
              <div key={date}>
                <h3 className="leading-loose font-normal mt-4">
                  {date}
                  <b className="float-right text-1 opacity-75 text-lg font-light">
                    +{totalTimeForDate(date)}
                  </b>
                </h3>
                {commits.map((commit, i) => (
                  <li key={i} className="group p-2 bg-1">
                    <div
                      className="m:flex"
                      onClick={() =>
                        setEditCommit({
                          ...commit,
                          editDate: moment(commit.commited_at).format(
                            "YYYY-MM-DDTHH:mm",
                          ),
                        })
                      }
                    >
                      <div>
                        <span className="text-1">
                          {prettyTime(commit.amount)}
                        </span>
                        {" commited at "}
                        <span className="text-1">
                          {prettyDate(commit.commited_at, "minutes")}
                        </span>
                      </div>
                      <div
                        className={`ml-auto group-hover:opacity-75 opacity-25 cursor-default text-right ${
                          editCommit &&
                          editCommit.commited_at === commit.commited_at
                            ? "font-bold"
                            : ""
                        }`}
                        tabIndex={0}
                      >
                        <Icon name="edit-3" />
                        Edit
                      </div>
                    </div>
                    {editCommit &&
                      editCommit.commited_at === commit.commited_at && (
                        <form
                          className="mt-4 pb-2 border-b"
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitEditedCommit();
                          }}
                        >
                          <div className="mb-2">
                            <label className="block text-sm mb-1">
                              Time amount:
                            </label>
                            <TimeInput
                              value={editCommit.amount}
                              onChange={(value) =>
                                setEditCommit({ ...editCommit, amount: value })
                              }
                            />
                          </div>

                          <div className="mb-2">
                            <DateInput
                              value={editCommit.editDate || ""}
                              onChange={(value) =>
                                setEditCommit({
                                  ...editCommit,
                                  editDate: value,
                                })
                              }
                              label="Date and Time:"
                            />
                          </div>

                          <div className="flex">
                            <button type="submit" className="btn btn-primary">
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-default ml-1"
                              onClick={() => setEditCommit(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                  </li>
                ))}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Commits;
