import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 420px;
  padding: 50px 0px;
`;

export const Title = styled.h1`
  font-size: 42px;
  display: flex;
  margin: 0px;
  font-weight: 600;
`;

export const Form = styled.form`
  margin-top: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const Input = styled.input`
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  width: 100%;
  font-size: 16px;

  &[type="submit"] {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
`;

export const Error = styled.span`
  font-weight: 600;
  color: tomato;
`;

export const ErrorFindPw = styled(Error)`
  width: fit-content;
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: #222;
  text-decoration: underline;
`;

export const Switcher = styled.span`
  margin-top: 20px;
  a {
    color: #1d9bf0;
  }
`;

/*  --------------------------------Social login Button------------------------ */

export const FindPwWrapper = styled(Switcher)`
  button {
    font-size: 100%;
    background-color: transparent;
    color: #1d9bf0;
    border: none;
    padding: 0;
    margin-bottom: 40px;
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const Overlay = styled.div`
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const PwForm = styled(Form)`
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto auto;
  height: fit-content;
  span {
    text-align: center;
  }
`;

/*  --------------------------------Social login Button------------------------ */
export const SocialButton = styled.span`
  width: 100%;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  margin-top: 15px;
  background-color: white;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: box-shadow opacity 0.2s ease-in-out;
  &:hover {
    box-shadow: 0 0 10px 0 #3d9bff inset, 0 0 10px 4px #3d9bff;
  }
`;

export const BtnLogo = styled.img`
  height: 20px;
`;

/* -- trash & archive  delete all btn -- */
export const Button = styled.button`
  display: flex;
  align-items: center;
  background-color: #f44336;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 18px;
  color: white;
  cursor: pointer;
  svg {
    width: 30px;
    margin-right: 7px;
  }
  margin-left: auto;
  transition: background-color 0.3s, color 0.3s;
  &: hover {
    background-color: white;
    color: #f44336;
  }
`;
