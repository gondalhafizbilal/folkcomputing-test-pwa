import { ChangeEvent, FC, InputHTMLAttributes, ReactElement } from "react";

import { cn } from "../../utils";

import "./style.css";

type CheckBoxProps = InputHTMLAttributes<HTMLInputElement> & {
  selected: boolean;
  onSelection: (selected: boolean) => void;
  error?: boolean;
};

const CheckBox: FC<CheckBoxProps> = ({
  className,
  selected,
  onSelection,
  error,
  ...restProps
}): ReactElement => {
  return (
    <input
      type="checkbox"
      // defaultChecked={selected}
      checked={selected}
      className={cn("primary-checkbox", className, {
        error,
      })}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onSelection(event.target.checked);
      }}
      {...restProps}
    />
  );
};

export default CheckBox;
