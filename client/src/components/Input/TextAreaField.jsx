import { AlertCircle, List } from "lucide-react";
import { useRef } from "react";

const TextAreaField = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 6,
  allowBullets = false,
  ...props
}) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (!allowBullets) return;

    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPosition);
      const currentLine = textBeforeCursor.split('\n').pop();

      if (currentLine.trim().startsWith("•")) {
        e.preventDefault();

        // If it's an empty bullet, remove it
        if (currentLine.trim() === "•") {
          const newValue = value.substring(0, cursorPosition - currentLine.length) + value.substring(cursorPosition);
          onChange({ target: { name: props.name || id, value: newValue } });
          // Note: Selection restoration needs a small timeout due to React state update
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPosition - currentLine.length;
            }
          }, 0);
          return;
        }

        // Add bullet to new line
        const insertText = "\n• ";
        const newValue = value.substring(0, cursorPosition) + insertText + value.substring(cursorPosition);
        onChange({ target: { name: props.name || id, value: newValue } });

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPosition + insertText.length;
          }
        }, 0);
      }
    }
  };

  const insertBullet = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;

    let insertText = "• ";
    // If not at the beginning of a line and not following a newline, add a newline first
    if (cursorPosition > 0 && value[cursorPosition - 1] !== '\n') {
      insertText = "\n• ";
    }

    const newValue = value.substring(0, cursorPosition) + insertText + value.substring(cursorPosition);
    onChange({ target: { name: props.name || id, value: newValue } });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + insertText.length;
    }, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {allowBullets && (
          <button
            type="button"
            onClick={insertBullet}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="Add Bullet Point"
          >
            <List className="w-3.5 h-3.5" />
            Bullet Format
          </button>
        )}
      </div>
      <textarea
        id={id}
        ref={textareaRef}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        value={value}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2.5 border rounded-lg text-base transition-colors 
            duration-200 resize-y disabled:bg-gray-50 disabled:text-gray-50 ${error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          } focus:outline-none focus:ring-2 focus:ring-opacity-20
            `}
        style={{ minHeight: "150px" }}
        {...props}
      />
      {error && (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className=" text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default TextAreaField;
