import Sidebar from "./Sidebar.jsx";
import "./layout.css";

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default Layout;