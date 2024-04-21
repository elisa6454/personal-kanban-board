import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  Droppable,
  DropResult,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { IBoard, isLightState, toDoState } from "../atoms";
import Board from "./Board";
import { darkTheme, lightTheme } from "../theme";
import { useEffect } from "react";
import { db } from "../firebase";

const Trash = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: -3.75rem;
  left: calc(50vw - 3.5rem);
  width: 7.5rem;
  height: 3.75rem;
  border-radius: 0 0 100rem 100rem;
  background-color: tomato;
  box-shadow: -0.1rem 0 0.4rem rgb(210 77 77 / 15%);
  font-size: 10px;
  z-index: 5;
  transition: transform 0.3s;

  & > div {
    margin-bottom: 0.5rem;
    color: rgba(, 0, 0, 0.5);
  }
`;
const GlobalStyle = createGlobalStyle`
	html, body, div, span, applet, object, iframe,
	h1, h2, h3, h4, h5, h6, p, blockquote, pre,
	a, abbr, acronym, address, big, cite, code,
	del, dfn, em, img, ins, kbd, q, s, samp,
	small, strike, strong, sub, sup, tt, var,
	b, u, i, center,
	dl, dt, dd, ol, ul, li,
	fieldset, form, label, legend,
	table, caption, tbody, tfoot, thead, tr, th, td,
	article, aside, canvas, details, embed,
	figure, figcaption, footer, header, hgroup,
	menu, nav, output, ruby, section, summary,
	time, mark, audio, video {
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 100%;
		font: inherit;
		vertical-align: baseline;
	}
	/* HTML5 display-role reset for older browsers */
	article, aside, details, figcaption, figure,
	footer, header, hgroup, menu, nav, section {
		display: block;
	}
	body {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		line-height: 1;
		font-family: "Pretendard", sans-serif;
		background-color: ${(props) => props.theme.bgColor};
		color: ${(props) => props.theme.textColor};
		transition: background-color 0.3s, color 0.3s;
		overflow-y: hidden;
	}
	ol, ul {
		list-style: none;
	}
	blockquote, q {
		quotes: none;
	}
	blockquote:before, blockquote:after,
	q:before, q:after {
		content: '';
		content: none;
	}
	table {
		border-collapse: collapse;
		border-spacing: 0;
	}
	a {
		text-decoration: none;
		color: inherit;
	}
	* {
		box-sizing: border-box;
	}
	input, button {
		font-family: "Pretendard", sans-serif;
		color: inherit;
	}
	&:has(.dragging) ${Trash} {
		transform: translateY(3.75rem);
	}
	&:has(.dragging-over-trash) ${Trash} {
		transform: translateY(3.75rem) scale(1.2);
	}
`;

const Title = styled.h1`
  display: flex;
  margin: 0px;
  font-size: 2rem;
  font-weight: 600;
  transition: color 0.3s;
`;

const Boards = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  min-width: calc(100vw - 4rem);
  margin-right: 2rem;
  height: calc(100vh - 10rem);
  margin-top: 7rem;
  margin-left: 2rem;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  transition: color 0.3s;
  color: ${(props) => props.theme.secondaryTextColor};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  transition: color 0.3s;
  padding: 0;
  border-radius: 0.2rem;

  &:hover,
  &:focus {
    cursor: pointer;
    color: ${(props) => props.theme.accentColor};
  }

  &:focus {
    outline: 0.15rem solid ${(props) => props.theme.accentColor};
  }
`;

const Navigation = styled.nav`
  display: flex;
  position: fixed;
  padding: 2.5rem 7rem;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  color: ${(props) => props.theme.textColor};
`;

function getStyle(style: DraggingStyle | NotDraggingStyle) {
  if (style?.transform) {
    const axisLockX = `${style.transform.split(",").shift()}, 0px)`;
    return {
      ...style,
      transform: axisLockX,
    };
  }
  return style;
}

export default function KanbanBoard() {
  const [toDos, setToDos] = useRecoilState<IBoard[]>(toDoState);

  const [isLight, setIsLight] = useRecoilState(isLightState);
  const toggleTheme = () => setIsLight((current) => !current);

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: light")
      .addEventListener("change", (event) => {
        setIsLight(event.matches);
      });
  });
  // add new board
  const onAdd = async () => {
    const name = window.prompt("Please input board name.")?.trim();

    if (name !== null && name !== undefined) {
      if (name === "") {
        alert("Please input the name.");
        return;
      }

      try {
        const newBoard: IBoard = { title: name, id: Date.now(), toDos: [] };

        const docRef = doc(db, "kanbans", "trello-clone-to-dos");
        const docSnapshot = await getDoc(docRef);
        const existingData = docSnapshot.data();

        const modifiedData = {
          ...existingData,
          toDos: [...(existingData?.toDos || []), newBoard],
        };
        await setDoc(docRef, modifiedData);

        setToDos(() => {
          return [...(existingData?.toDos || []), newBoard];
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const onDragEnd = ({ source, destination }: DropResult) => {
    if (source.droppableId === "boards") {
      if (!destination) return;
      if (source.index === destination.index) return;

      // move within the same column
      if (source.index !== destination.index) {
        setToDos((prev) => {
          const toDosCopy = [...prev];
          const prevBoard = toDosCopy[source.index];

          toDosCopy.splice(source.index, 1);
          toDosCopy.splice(destination.index, 0, prevBoard);

          return toDosCopy;
        });
      }
    } else if (source.droppableId !== "boards") {
      if (!destination) return;

      // remove from a column and add to another
      if (destination.droppableId === "trash") {
        setToDos((prev) => {
          const toDosCopy = [...prev];
          const boardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === source.droppableId.split("-")[1]
          );
          const boardCopy = { ...toDosCopy[boardIndex] };
          const listCopy = [...boardCopy.toDos];

          listCopy.splice(source.index, 1);
          boardCopy.toDos = listCopy;
          toDosCopy.splice(boardIndex, 1, boardCopy);

          return toDosCopy;
        });
        return;
      }
      //  moving task between lists in the same column
      if (source.droppableId === destination.droppableId) {
        setToDos((prev) => {
          const toDosCopy = [...prev];
          const boardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === source.droppableId.split("-")[1]
          );
          const boardCopy = { ...toDosCopy[boardIndex] };
          const listCopy = [...boardCopy.toDos];
          const prevToDo = boardCopy.toDos[source.index];

          listCopy.splice(source.index, 1);
          listCopy.splice(destination.index, 0, prevToDo);

          boardCopy.toDos = listCopy;
          toDosCopy.splice(boardIndex, 1, boardCopy);

          return toDosCopy;
        });
      }
      // cross board movement
      if (source.droppableId !== destination.droppableId) {
        setToDos((prev) => {
          const toDosCopy = [...prev];

          const sourceBoardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === source.droppableId.split("-")[1]
          );
          const destinationBoardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === destination.droppableId.split("-")[1]
          );

          const sourceBoardCopy = { ...toDosCopy[sourceBoardIndex] };
          const destinationBoardCopy = { ...toDosCopy[destinationBoardIndex] };

          const sourceListCopy = [...sourceBoardCopy.toDos];
          const destinationListCopy = [...destinationBoardCopy.toDos];

          const prevToDo = sourceBoardCopy.toDos[source.index];

          sourceListCopy.splice(source.index, 1);
          destinationListCopy.splice(destination.index, 0, prevToDo);

          sourceBoardCopy.toDos = sourceListCopy;
          destinationBoardCopy.toDos = destinationListCopy;

          toDosCopy.splice(sourceBoardIndex, 1, sourceBoardCopy);
          toDosCopy.splice(destinationBoardIndex, 1, destinationBoardCopy);

          return toDosCopy;
        });
      }
    }
  };

  return (
    <ThemeProvider theme={isLight ? lightTheme : darkTheme}>
      <GlobalStyle />

      <Navigation>
        <Title>My Board</Title>
        <Buttons>
          <Button onClick={onAdd}>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
            </svg>
          </Button>
          <Button onClick={toggleTheme}>
            {isLight ? (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
              </svg>
            ) : (
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
                />
              </svg>
            )}
          </Button>
        </Buttons>
      </Navigation>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="boards" direction="horizontal" type="BOARDS">
          {(provided) => (
            <Boards ref={provided.innerRef} {...provided.droppableProps}>
              {toDos.map((board, index) => (
                <Draggable
                  draggableId={"board-" + board.id}
                  key={board.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Board
                      board={board}
                      parentProvided={provided}
                      isHovering={snapshot.isDragging}
                      style={getStyle(provided.draggableProps.style!)}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Boards>
          )}
        </Droppable>

        <Droppable droppableId="trash" type="BOARD">
          {(provided) => (
            <div>
              <Trash ref={provided.innerRef} {...provided.droppableProps}>
                <svg
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                  />
                </svg>
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5Zm5.22 1.72a.75.75 0 0 1 1.06 0L10 10.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L11.06 12l1.72 1.72a.75.75 0 1 1-1.06 1.06L10 13.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L8.94 12l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                  />
                </svg>
              </Trash>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ThemeProvider>
  );
}
