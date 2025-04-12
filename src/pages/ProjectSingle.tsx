import React from "react";
import { useParams } from "react-router-dom";
import Single from "../components/Projects/Single";

const ProjectSingle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <div>Project not found</div>;
  }

  return <Single />;
};

export default ProjectSingle;
