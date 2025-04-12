import React from "react";
import { useParams } from "react-router";
import Layout from "../components/Layout";
import Commits from "../components/Projects/Commits";

const ProjectCommits: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Layout>Project not found</Layout>;
  }

  return (
    <Layout>
      <Commits />
    </Layout>
  );
};

export default ProjectCommits;
