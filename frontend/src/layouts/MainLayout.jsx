import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Rightbar from "../components/common/Rightbar";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <Outlet />
      <Rightbar />
    </div>
  );
};

export default MainLayout;
