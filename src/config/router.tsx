import { createHashRouter, Navigate } from 'react-router-dom';
import TodoPage from '../components/TodoPage.tsx';
import LoginPage from '../components/LoginPage.tsx';
import RegisterPage from '../components/RegisterPage.tsx';
import Layout from '../components/Layout';

const isAuthenticated = () => !!localStorage.getItem('token'); // Check login status

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

export default createHashRouter([
  {
    element: <Layout />, // Wrap all routes with the Layout
    children: [
      {
        path: '/',
        element: <ProtectedRoute element={<TodoPage />} />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
]);
