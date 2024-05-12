import { FC, HTMLAttributes, PropsWithChildren, ReactElement } from "react";

import "./style.css";
import { cn } from "../../utils";

const Card: FC<
  PropsWithChildren<
    HTMLAttributes<HTMLDivElement> & { variant?: "primary-bordered" }
  >
> = ({ variant, children, className, ...restProps }): ReactElement => {
  return (
    <div className={cn("card", variant, className)} {...restProps}>
      {children}
    </div>
  );
};

export default Card;
