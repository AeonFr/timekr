import React from "react";
import { Link } from "react-router-dom";
import useStore from "../store";
import Logo from "../components/Logo";

const ProjectsIndex: React.FC = () => {
  const projects = useStore((state) => state.projects);
  const projectsArray = Object.entries(projects);

  return (
    <div className="text-center">
      <Logo />

      <h1 className="text-xl tracking-wide uppercase font-light leading-loose">
        Welcome to Timekr
      </h1>

      <p className="text-lg leading-normal">
        A simple time tracking app for your projects.
      </p>

      {projectsArray.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-lg leading-normal">Your Projects:</h2>
          <ul className="list-reset">
            {projectsArray.map(([slug, project]) => (
              <li key={slug} className="my-2">
                <Link
                  to={`/project/${slug}`}
                  className="btn btn-primary no-underline"
                >
                  {project.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-lg leading-normal">
          <p>You don't have any projects yet.</p>
          <p>Create one using the form in the sidebar.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsIndex;
