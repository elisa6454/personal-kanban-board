import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { BtnLogo, SocialButton } from "./auth-components";

export default function GithubButton() {
  const navigate = useNavigate();

  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      alert("Fail: Social login is fail.");
      console.error(error);
    }
  };

  return (
    <SocialButton onClick={onClick}>
      <BtnLogo src="/google-logo.svg" />
      Continue with Google
    </SocialButton>
  );
}
