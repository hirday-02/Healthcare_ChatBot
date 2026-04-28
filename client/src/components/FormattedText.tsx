import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
  const formatMarkdown = (input: string) => {
    // Escape HTML to prevent XSS
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let safeHtml = escapeHtml(input);

    // Replace **text** with <strong>text</strong>
    safeHtml = safeHtml.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *text* with <em>text</em> if they want italic, but user requested to just remove * and make bold.
    // Let's replace single asterisks that wrap text with <strong>text</strong> as well.
    // But sometimes * is used as a bullet point at the start of a line.
    
    // Convert * at the start of a line into a bullet point •
    safeHtml = safeHtml.replace(/^\s*\*\s+/gm, '• ');

    // For any remaining single asterisks wrapping words, make them bold (or just remove them)
    // The user said "remove this * in the response in the chat everywhere make the word bold"
    safeHtml = safeHtml.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    return safeHtml;
  };

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }}
      style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
    />
  );
};
