import MainLayout from "../layouts/MainLayout";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Auth = () => {
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

  if (!authUser) {
    return <Navigate to="/auth/login" />;
  }
  return <MainLayout />;
};

export default Auth;
