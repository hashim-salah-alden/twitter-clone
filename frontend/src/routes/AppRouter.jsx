import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Home, Signup, Login, Profile } from "../pages/index.js";

import MainLayout from "../layouts/MainLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

import { useQuery } from "@tanstack/react-query";

const AppRouter = () => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      // errorElement: <Error />,
      children: [
        {
          index: true,
          element: authUser ? <Home /> : <Navigate to="/auth/login" />,
        },
        {
          path: "/home",
          element: authUser ? <Home /> : <Navigate to="/auth/login" />,
        },

        { path: "/profile/:username", element: authUser ? <Profile /> : <Navigate to="/auth/login" />},
      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      // errorElement: <Error />,
      children: [
        {
          index: true,
          element: !authUser ?  <Signup /> : <Navigate to="/home" />,
        },
        {
          path: "/auth/signup",
          element: !authUser ?  <Signup /> : <Navigate to="/home" />,
        },
        { path: "/auth/login", element: !authUser ?  <Login /> : <Navigate to="/home" /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
