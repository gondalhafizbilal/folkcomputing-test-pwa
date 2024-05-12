import { FC, ReactElement } from "react";
import { Outlet } from "react-router-dom";

import "./style.css";

const MainLayout: FC = (): ReactElement => {
  return (
    <div className="page">
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
