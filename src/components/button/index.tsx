/* External Deps */
import { FC, PropsWithChildren, ButtonHTMLAttributes } from "react";

/* Internal Deps */
import { cn } from "../../utils";

import "./styles.scss";

interface IButtonProps extends PropsWithChildren {
  disabled?: boolean;
  loading?: boolean;
  variant?: "text" | "outlined" | "contained" | "link";
  active?: boolean;
  ripple?: boolean;
}

const Button: FC<ButtonHTMLAttributes<HTMLButtonElement> & IButtonProps> = ({
  children,
  className,
  disabled = false,
  loading = false,
  variant = "contained",
  active = false,
  ...rest
}) => {
  return (
    <button
      className={cn("button", variant, className, {
        active,
      })}
      disabled={disabled ?? loading}
      aria-disabled={disabled ?? loading}
      {...rest}
      onClick={(e) => {
        rest?.onClick?.(e);
      }}
    >
      {children}{" "}
      {/* {loading && variant !== "text" && (
        <span className="relative">
          <SPiner className="animate-spin" />
        </span>
      )} */}
    </button>
  );
};

export default Button;
