import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Registro from "./pages/Registro";
import ProtectedRoute from "./components/ProtectedRoute";
import { USER_ADMIN_ROLES } from "./constants/roles";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/registro" element={<Registro />} />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;