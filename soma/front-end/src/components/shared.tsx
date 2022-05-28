import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex: wrap;
  padding: 20px;
  min-height: 300px;
  border: 1px solid black;
`;

export const EffectConnect = styled.div`
  display: flex;
`;

export const EffectContainer = styled.div<{ selected?: boolean; selectable: boolean }>`
  display: flex;
  flex-direction: column;
  height: 86px;
  width: 160px;
  padding: 5px;
  border: 1px solid
    ${({ selected, selectable }) =>
      selectable ? (selected ? "red" : "blue") : "purple"};
  border-radius: 5px;
`;

export const CloseX = styled.div`
  height: 16px;
  width: 10px;
  cursor: pointer;
  align-self: flex-end;
  &:hover {
    color: red;
  }
`;

export const EffectBox = styled.div<{ selectable?: boolean }>`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ selectable }) => (selectable ? "pointer" : "auto")};
`;