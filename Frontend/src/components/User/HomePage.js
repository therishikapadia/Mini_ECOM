import React from "react";
const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#000",
  icon: "#000",
};
const HomePage = ({darkMode}) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  return (
    <div className="p-5" style={{backgroundColor:currentColors.background,color:currentColors.text}}>
      <h2 className="text-2xl font-bold mb-4">Welcome to the User Dashboard</h2>
    </div>
  );
};

export default HomePage;
