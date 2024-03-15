import styled from "styled-components";

const Title = styled.h1`
  display: flex;
  margin: 0px;
  font-size: 2rem;
  font-weight: 600;
  transition: color 0.3s;
`;

const Button = styled.button`
  background-color: #f44336;
  color: white;
  padding: 3px 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`;

export default function TrashBoard() {
  return (
    <>
      <Title>Trash Board</Title>
      <Button>
        <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          />
        </svg>
        clear all trash
      </Button>
    </>
  );
}
