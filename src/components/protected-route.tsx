import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = auth.currentUser; // let know if the user is logged in or not
  if (user === null) {
    return <Navigate to="/login" />; // Navigater is redirecting the page to another page to user
  } // this mean is
  return children;
}

//컴포넌트에서 하는 건 firebase에서 유저 정보를 요청하는 것.
