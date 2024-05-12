import { FC, HTMLAttributes, PropsWithChildren, ReactElement } from "react";

import "./style.css";
import { cn } from "../../utils";

type ContainerProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

const Container: FC<ContainerProps> = ({
  children,
  className,
  ...rest
}): ReactElement => {
  return (
    <div className={cn("page-container", className)} {...rest}>
      {children}
    </div>
  );
};

export default Container;
