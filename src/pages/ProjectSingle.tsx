import React from "react";
import { useParams } from "react-router";
import Layout from "../components/Layout";
import Single from "../components/Projects/Single";

const ProjectSingle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <Layout>
        <div>Project not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Single key={slug} />
    </Layout>
  );
};

export default ProjectSingle;
