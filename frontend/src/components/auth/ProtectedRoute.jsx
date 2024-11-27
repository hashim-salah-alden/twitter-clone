/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  useEffect(() => {
    if (!authUser) {
      <Navigate to="/auth/login" />;
    }
  }, [authUser]);

  return <>{children}</>;
};

export default ProtectedRoute;
