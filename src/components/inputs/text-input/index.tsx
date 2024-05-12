import { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import "./styles.scss";
import { cn } from "../../../utils";

interface TextInputProps {
  id?: string;
  placeholder?: string;
  value?: string | number;
  // eslint-disable-next-line no-unused-vars
  onChange?: (_e: ChangeEvent<HTMLInputElement>) => void;
  inputType: string;
  error?: boolean;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  containerClass?: string;
  inputClass?: string;
  labelClass?: string;
  required?: boolean;
  styled?: boolean;
  onInvalidMessage?: string;
  onKeyDown?: (_e: KeyboardEvent<HTMLInputElement>) => void; // Adjusted type
}

const TextInput = ({
  id,
  placeholder,
  value,
  onChange,
  inputType,
  label,
  disabled,
  containerClass,
  labelClass,
  inputClass,
  error = false,
  helperText,
  required,
  styled = false,
  onInvalidMessage = "Please enter a value!",
  onKeyDown,
}: TextInputProps): ReactNode => {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.setCustomValidity("");
    onChange?.(e);
  };

  return (
    <div className={cn("unique-text-input", containerClass)}>
      {label && (
        <label htmlFor={id} className={cn("label", labelClass)}>
          {label}
        </label>
      )}
      <input
        id={id}
        onKeyDown={onKeyDown}
        name={id}
        type={inputType || "text"}
        value={value}
        placeholder={`${placeholder}${required ? " *" : ""}`}
        onChange={handleOnChange}
        disabled={disabled}
        className={cn("input", inputClass, {
          styled,
        })}
        required={required}
        onInvalid={(e) => {
          e.currentTarget.setCustomValidity(onInvalidMessage);
        }}
      />
      {error && helperText && (
        <div className="error-section">
          <div className="error-message">{helperText}</div>
        </div>
      )}
    </div>
  );
};

export default TextInput;
