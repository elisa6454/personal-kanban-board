import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { BtnLogo, SocialButton } from "./auth-components";

export default function GithubButton() {
  const navigate = useNavigate();

  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      alert("Fail: Social login is fail.");
      console.error(error);
    }
  };

  return (
    <SocialButton onClick={onClick}>
      <BtnLogo src="/github-logo.svg" />
      Continue with Github
    </SocialButton>
  );
}
