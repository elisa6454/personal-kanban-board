import { IToDo, toDoState } from "../atoms";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.2rem;
  width: 2rem;
  height: 2rem;
  transition: opacity 0.3s, background-color 0.3s, color 0.3s;
  cursor: pointer;
  color: ${(props) => props.theme.secondaryTextColor};
  background-color: transparent;
  border: none;
  font-size: 1.2rem;

  &:hover,
  &:active,
  &:focus-within {
    background-color: ${(props) => props.theme.hoverButtonOverlayColor};
  }
`;

const Buttons = styled.div`
  display: flex;
  position: absolute;
  top: calc(50% - 1rem);
  right: 0.375rem;
  justify-content: space-between;
  gap: 0.125rem;
`;

const Card = styled.li`
  background-color: ${(props) => props.theme.cardColor};
  padding: 0.8rem;
  border-radius: 0.4rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
  margin-bottom: 0.6rem;
  height: 2.75rem;
  display: block;
  transition: background-color 0.3s, color 0.3s, box-shadow 0.3s, opacity 0.3s;
  user-select: none;
  position: relative;
  font-size: 1rem;

  &.dragging {
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.25);
  }

  &.dragging-over-trash {
    background-color: tomato !important;
    color: white;
  }

  &:focus-within {
    background-color: ${(props) => props.theme.accentColor};
    outline: 0.15rem solid ${(props) => props.theme.textColor};
    color: white;
  }

  & > :first-child {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    transition: width 0.3s;
    margin-top: 0.1rem;
  }

  &:not(:hover):not(:focus-within) ${Button} {
    opacity: 0;
  }

  &:hover > :first-child,
  &:focus-within > :first-child {
    width: 8.75rem;
  }

  &:focus-within ${Button} {
    color: white;
  }

  &:focus-within ${Button}:focus {
    outline: 0.15rem solid white;
  }
`;

interface IDraggableCardProps {
  toDo: IToDo;
  index: number;
  boardId: number;
}

function DraggableCard({ toDo, index, boardId }: IDraggableCardProps) {
  const setToDos = useSetRecoilState(toDoState);

  const onEdit = () => {
    const newToDoText = window
      .prompt(
        `Please enter a new task name to edit in ${toDo.text} `,
        toDo.text
      )
      ?.trim();

    if (newToDoText !== null && newToDoText !== undefined) {
      if (newToDoText === "") {
        alert("Please enter the name.");
        return;
      }

      setToDos((prev) => {
        const toDosCopy = [...prev];
        const boardIndex = toDosCopy.findIndex((board) => board.id === boardId);
        const boardCopy = { ...toDosCopy[boardIndex] };
        const listCopy = [...boardCopy.toDos];
        const toDoIndex = boardCopy.toDos.findIndex((td) => td.id === toDo.id);

        listCopy.splice(toDoIndex, 1, {
          text: newToDoText,
          id: toDo.id,
        });

        boardCopy.toDos = listCopy;
        toDosCopy.splice(boardIndex, 1, boardCopy);

        return toDosCopy;
      });
    }
  };

  const onDelete = () => {
    if (window.confirm(`Are you delete [${toDo.text}] task?`)) {
      setToDos((prev) => {
        const toDosCopy = [...prev];
        const boardIndex = toDosCopy.findIndex((board) => board.id === boardId);
        const boardCopy = { ...toDosCopy[boardIndex] };
        const listCopy = [...boardCopy.toDos];
        const toDoIndex = boardCopy.toDos.findIndex((td) => td.id === toDo.id);

        listCopy.splice(toDoIndex, 1);
        boardCopy.toDos = listCopy;
        toDosCopy.splice(boardIndex, 1, boardCopy);

        return toDosCopy;
      });
    }
  };

  return (
    <Draggable draggableId={"todo-" + toDo.id} index={index}>
      {(provided, snapshot) => (
        <Card
          className={`${snapshot.isDragging ? "dragging" : ""} ${
            snapshot.draggingOver === "trash" ? "dragging-over-trash" : ""
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div>{toDo.text}</div>
          <Buttons>
            <Button onClick={onEdit}>
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
              </svg>
            </Button>
            <Button onClick={onDelete}>
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </Button>
          </Buttons>
        </Card>
      )}
    </Draggable>
  );
}

export default React.memo(DraggableCard);
