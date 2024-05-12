/* External Deps */
import { FC, ReactElement, useRef, useState } from "react";

/* Internal Deps */
import { cn } from "../../utils";

import "./style.scss";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

type Dropdown = {
  options: DropdownOption[];
  selectValue: (e: string) => void;
  selectedoption: string;
  placeholder?: string;
};

type DropdownOption = {
  value: string;
  label: string;
};

const Dropdown: FC<Dropdown> = ({
  options,
  selectValue,
  selectedoption,
  placeholder,
}): ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (value: DropdownOption): void => {
    selectValue(value.value);
    setIsOpen(false);
  };

  return (
    <div
      className="dropdownfield w-full"
      ref={menuRef}
      onClick={toggleDropdown}
    >
      <div className="dropdown-toggle">
        {selectedoption || placeholder}{" "}
        <ChevronDownIcon className="w-8 dark:bg-secondary-dark bg-white" />
      </div>
      <div className={cn("dropdown-menu", { hide: !isOpen })}>
        {(options ?? []).map((option) => (
          <div
            key={option.value}
            className="dropdown-option"
            onClick={() => handleOptionSelect(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
