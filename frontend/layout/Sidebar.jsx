import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";
import jivanJyot from "../src/assets/jivanjyot-red.png";
const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      {/* Logo / Brand */}
      <div className="logo">
        <img src={jivanJyot} alt="jivanJyot" onClick={() => navigate("/")} />
      </div>

      {/* Navigation */}
      <nav className="nav-links">
        <NavLink to="/company-patient">Company Patient</NavLink>

        <NavLink to="/" end>
          Patient Report
        </NavLink>

        <NavLink to="/company">Company</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
