import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { isLightState, deletedArchiveState, DeletedCardInfo } from "../atoms";
import { darkTheme, lightTheme } from "../theme";
import { DeleteBtn, Title } from "./auth-components";
import { useEffect } from "react";
import { collection, deleteDoc, getDocs, doc } from "firebase/firestore";
import { db } from "../firebase";

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
`;
const Buttons = styled.div``;

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

const ArchiveItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: 500px;
  max-width: 600px;
  margin-bottom: 1rem;
  background-color: ${(props) => props.theme.secondaryBgColor};
  border-radius: 0.5rem;
  box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.1);
`;

const ArchiveItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
`;

const ArchiveItemText = styled.p`
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArchivePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
`;

export default function ArchiveList() {
  const [isLight, setIsLight] = useRecoilState(isLightState);
  const toggleTheme = () => setIsLight((current) => !current);

  const archivedCards = useRecoilValue(deletedArchiveState);
  const setArchivedCards = useSetRecoilState(deletedArchiveState);

  /* const handleDeleteAllTrash = () => {
    // Logic to delete all trash items
    setArchivedCards([]);
  };

  const onDelete = (index: number) => {
    //  Logic to remove the selected item from the list
    const updatedArchivedCards = [...archivedCards];
    updatedArchivedCards.splice(index, 1);
    setArchivedCards(updatedArchivedCards);
  }; */

  const handleDeleteAllTrash = async () => {
    try {
      const archiveQuerySnapshot = await getDocs(
        collection(db, "archive-cards")
      );
      archiveQuerySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setArchivedCards([]);
    } catch (error) {
      console.error("Error deleting all archived cards:", error);
    }
  };

  const onDelete = async (index: number) => {
    try {
      const documentRef = doc(db, "archive-cards");
      await deleteDoc(documentRef);

      // Update the state after successfully deleting the document
      const updatedArchivedCards = [...archivedCards];
      updatedArchivedCards.splice(index, 1);
      setArchivedCards(updatedArchivedCards);
    } catch (error) {
      console.error("Error deleting archived card:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reference the "archived-cards" collection in Firestore
        const querySnapshot = await getDocs(collection(db, "archived-cards"));
        const data: DeletedCardInfo[] = [];

        // Iterate through each document in the collection
        querySnapshot.forEach((doc) => {
          const cardData = doc.data();

          // Ensure that the document data matches ArchivedCardInfo
          if (
            typeof cardData.id === "number" &&
            typeof cardData.boardId === "number" &&
            typeof cardData.text === "string"
          ) {
            // Add the document data to the array
            data.push({
              id: cardData.id,
              boardId: cardData.boardId,
              text: cardData.text,
              archiveTime: cardData.archiveTime,
            });
          }
        });

        // Update the state with the fetched data
        setArchivedCards(data);
      } catch (error) {
        console.error("Error fetching archived cards:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ThemeProvider theme={isLight ? lightTheme : darkTheme}>
      <GlobalStyle />
      <Title>Archive Board</Title>
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

      <DeleteBtn onClick={handleDeleteAllTrash}>
        <svg
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
          />
        </svg>
        Delete all
      </DeleteBtn>

      <ArchivePageContainer>
        {archivedCards
          .filter((card) => card.boardId === 2)
          .map((card, index) => {
            return (
              <ArchiveItem key={index}>
                <ArchiveItemInfo>
                  <ArchiveItemText>
                    <p>{card.text}</p>
                  </ArchiveItemText>
                  <ArchiveItemText>
                    <p>{card.boardId === 2 ? "Done" : card.boardId}</p>
                  </ArchiveItemText>
                  <ArchiveItemText>
                    <p>{card.archiveTime}</p>
                  </ArchiveItemText>
                </ArchiveItemInfo>
                <Buttons>
                  <Button onClick={() => onDelete(index)}>
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
              </ArchiveItem>
            );
          })}
      </ArchivePageContainer>
    </ThemeProvider>
  );
}
