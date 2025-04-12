import React from 'react';
import { icons } from 'feather-icons';

interface IconProps {
  name?: string;
}

const Icon: React.FC<IconProps> = ({ name = 'x' }) => {
  // Create a safe HTML object from the SVG content
  const createMarkup = () => {
    return { __html: icons[name].contents };
  };

  return (
    <svg
      className={`feather ${name}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={createMarkup()}
    />
  );
};

export default Icon;
