import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); 

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1
          className="text-lg font-bold cursor-pointer"
          onClick={() => navigate('/')}
        >
          My Todo App
        </h1>
        <div className="flex gap-4">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/login')}
                className="hover:underline"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="hover:underline text-red-400"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
