import type { ReactNode } from "react";
import SidebarNew from "./SidebarNew";
import Topbar from "./Topbar";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-layout">
      <SidebarNew />
      <div className="main-area">
        <Topbar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;