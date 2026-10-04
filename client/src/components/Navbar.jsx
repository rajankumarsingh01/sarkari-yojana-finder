import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg text-gray-800">
        Sarkari Yojana Finder
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              Find Schemes
            </Link>
            <Link to="/saved" className="text-gray-600 hover:text-blue-600">
              Saved
            </Link>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-gray-600 hover:text-blue-600">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}