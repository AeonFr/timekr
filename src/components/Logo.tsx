import React from "react";
import "./Logo.css";

const Logo: React.FC = () => {
  return (
    <div className="VueToNuxtLogo">
      <div className="Triangle Triangle--two" />
      <div className="Triangle Triangle--one" />
      <div className="Triangle Triangle--three" />
      <div className="Triangle Triangle--four" />
    </div>
  );
};

export default Logo;
