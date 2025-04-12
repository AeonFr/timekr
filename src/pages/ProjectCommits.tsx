import React from 'react';
import { useParams } from 'react-router-dom';
import Commits from '../components/Projects/Commits';

const ProjectCommits: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <div>Project not found</div>;
  }
  
  return <Commits />;
};

export default ProjectCommits;
