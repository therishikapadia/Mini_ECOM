// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
// import AdminPanel from "./components/Admin/AdminPanel"; // Import AdminPanel component
// import LoginPage from "./components/Admin/LoginPage";
// import SignupPage from "./components/Admin/SignupPage";

// function App() {
//   return (
//     <div>
//       <Routes>
//         {/* Route for Login */}
//         <Route path="/" element={<LoginPage apiBaseUrl="http://localhost:8000" />} />
        
//         {/* Route for Admin Panel */}
//         <Route path="/admin/*" element={<AdminPanel apiBaseUrl="http://localhost:8000" />} />

//         <Route path="/signup" element={<SignupPage apiBaseUrl="http://localhost:8000"/>} />
//       </Routes>
//     </div>
//   );
// }

// export default App;





import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPanel from "./components/Admin/AdminPanel";
import LoginPage from "./components/Admin/LoginPage";
import SignupPage from "./components/Admin/SignupPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      navigate("/admin", { replace: true }); // Prevent redundant history entries
    } else {
      setIsAuthenticated(false);
      navigate("/", { replace: true }); // Prevent redundant history entries
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally leaving navigate out of the dependency array


  return (
    <div>
      <Routes>
        {/* Protected Route for Admin Panel */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminPanel apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

      
        {/* Public Route for Login */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <LoginPage apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        {/* Public Route for Signup */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignupPage apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
