import React from "react";

export default function CodeSnippet({ title, code }){

  return(
  <div className="code-snippet">
    <span className="code-snippet__title">{title}</span>
    <div className="code-snippet__container">
      <div className="code-snippet__wrapper">
        <pre className="code-snippet__body">{code}</pre>
      </div>
    </div>
  </div>
  );
}
