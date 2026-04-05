import "./Loader.css";

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="loader-overlay">
        <div className="loader-box">
          <div className="loader-spinner" />
          <p className="loader-text">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <div className="loader-spinner" />
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;