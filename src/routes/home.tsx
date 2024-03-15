import { styled } from "styled-components";
import KanbanBoard from "../components/kanban-board";

const Wrapper = styled.div``;

export default function Home() {
  return (
    <Wrapper>
      <KanbanBoard />
    </Wrapper>
  );
}
