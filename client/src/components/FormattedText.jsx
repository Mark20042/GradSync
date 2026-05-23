import React from "react";

const FormattedText = ({ text, className = "" }) => {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-4 space-y-1">
          {currentList.map((item, idx) => (
            <li key={`li-${idx}`}>{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("•")) {
      // It's a bullet point
      currentList.push(trimmedLine.substring(1).trim());
    } else {
      flushList();
      if (trimmedLine) {
        elements.push(
          <p key={`p-${index}`} className={`mb-4 ${className}`}>
            {line}
          </p>
        );
      } else if (index < lines.length - 1) {
        // preserve blank lines as spacing, but avoid double spacing from margin-bottom
        elements.push(<div key={`spacer-${index}`} className="h-2"></div>);
      }
    }
  });

  flushList();

  return <div className={`text-gray-700 text-sm ${className}`}>{elements}</div>;
};

export default FormattedText;
