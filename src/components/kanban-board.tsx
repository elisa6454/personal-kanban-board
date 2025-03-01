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
import { IBoard, isLightState } from "../atoms";
import Board from "./Board";
import RandomQuote from "./quotes";
import { darkTheme, lightTheme } from "../theme";
import { useEffect } from "react";
import { saveDataToFirestore, toDoState } from "../firebaseUtils";
import { auth } from "../firebase";

const Trash = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: -3.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: 7.5rem;
  height: 3.75rem;
  border-radius: 0 0 100rem 100rem;
  background-color: tomato;
  box-shadow: -0.1rem 0 0.4rem rgb(210 77 77 / 15%);
  font-size: 10px;
  z-index: 5;
  transition: transform 0.3s, opacity 0.3s;
  opacity: 0;

  &.active {
    opacity: 1;
    transform: translateX(-50%) translateY(3.75rem);
  }
`;

const TrashIcon = styled.svg`
  width: 1.5rem;
  height: 1.5rem;
  fill: black;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
    opacity: 1;
		transform: translateY(3.75rem);
	}
	&:has(.dragging-over-trash) ${Trash} {
    opacity: 1;
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
  width: calc(100vw - 4rem);
  margin: 1rem;
  margin-top: 5rem;
  height: calc(100vh - 10rem);
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
  top: 4rem;
  left: 10;
  width: calc(100% - 5rem);
  height: 4rem;
  padding: 0 2rem;
  align-items: center;
  justify-content: space-between;
  color: ${(props) => props.theme.textColor};
  z-index: 1000;
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

  const onAdd = async () => {
    const user = auth.currentUser;
    const boardName = window.prompt("Please input board name.")?.trim();

    if (!user || !boardName) {
      alert("Please ensure you're logged in and input a valid board name.");
      return;
    }

    const userId = auth.currentUser; // UID of currently logged in user(현재 로그인한 사용자의 UID)

    // Create a new board object
    const newBoard = {
      title: boardName,
      id: Date.now(), // Generate a unique ID (ex- use Date.now())
      toDos: [], // Initial empty toDos array
    };

    // Update Recoil state instead of adding directly to Firestore
    setToDos((oldToDos: IBoard[]): IBoard[] => {
      const updatedToDos = [...oldToDos, newBoard];
      // After updating status save to Firestore
      saveDataToFirestore(userId, "trello-clone-to-dos", updatedToDos);
      return updatedToDos;
    });
  };

  const onDragEnd = ({ source, destination }: DropResult) => {
    if (source.droppableId === "boards") {
      if (!destination) return;
      if (source.index === destination.index) return;

      // move within the same column
      if (source.index !== destination.index) {
        setToDos((prev: IBoard[]): IBoard[] => {
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
        setToDos((prev: IBoard[]): IBoard[] => {
          const toDosCopy = [...prev];
          const boardIndex = toDosCopy.findIndex(
            (board: IBoard) =>
              board.id + "" === source.droppableId.split("-")[1]
          );
          const board = toDosCopy[boardIndex];
          if (board) {
            const boardCopy = { ...board };
            const listCopy = [...boardCopy.toDos];

            listCopy.splice(source.index, 1);
            boardCopy.toDos = listCopy;
            toDosCopy.splice(boardIndex, 1, boardCopy);
          } else {
            console.error(`Invalid board index: ${boardIndex}`);
            return prev;
          }

          return toDosCopy;
        });
        return;
      }
      //  moving task between lists in the same column
      if (source.droppableId === destination.droppableId) {
        setToDos((prev: IBoard[]): IBoard[] => {
          const toDosCopy = [...prev];
          const boardIndex = toDosCopy.findIndex(
            (board: IBoard) =>
              board.id + "" === source.droppableId.split("-")[1]
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
        setToDos((prev: IBoard[]): IBoard[] => {
          const toDosCopy = [...prev];

          const sourceBoardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === source.droppableId.split("-")[1]
          );
          const destinationBoardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === destination.droppableId.split("-")[1]
          );

          const checksourceBoard = toDosCopy[sourceBoardIndex];
          const checkdestinationBoard = toDosCopy[destinationBoardIndex];

          if (!checksourceBoard || !checkdestinationBoard) {
            console.error(
              `Invalid board index: ${sourceBoardIndex} or ${destinationBoardIndex}`
            );
            return prev;
          } else {
            const sourceBoardCopy = { ...toDosCopy[sourceBoardIndex] };
            const destinationBoardCopy = {
              ...toDosCopy[destinationBoardIndex],
            };

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
          }
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
      <RandomQuote />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="boards" direction="horizontal" type="BOARDS">
          {(provided) => (
            <Boards ref={provided.innerRef} {...provided.droppableProps}>
              {toDos &&
                toDos.map((board, index) => (
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
                <TrashIcon>
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
                </TrashIcon>
                {provided.placeholder}
              </Trash>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ThemeProvider>
  );
}
