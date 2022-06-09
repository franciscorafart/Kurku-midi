import styled from "styled-components";
import theme from "config/theme";

export const Container = styled.div`
  display: flex;
  flex: wrap;
  padding: 20px;
  min-height: 300px;
  background-colors: ${theme.background2};
`;

export const EffectConnect = styled.div`
  display: flex;
`;

export const EffectContainer = styled.div<{
  selected?: boolean;
  selectable: boolean;
}>`
  display: flex;
  flex-direction: column;
  height: 86px;
  width: 160px;
  padding: 5px;
  border: 1px solid
    ${({ selected, selectable }) =>
      selectable
        ? selected
          ? theme.selected
          : theme.selectable
        : theme.notSelecteble};
  border-radius: 5px;
`;

export const CloseX = styled.div`
  height: 16px;
  width: 10px;
  cursor: pointer;
  color: ${theme.text}
  align-self: flex-end;
  &:hover {
    color: ${theme.text2};
  }
`;

export const EffectBox = styled.div<{ selectable?: boolean }>`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ selectable }) => (selectable ? "pointer" : "auto")};
  color: ${theme.text};
`;

export const Text = styled.span`
  color: ${theme.text};
`;

export const Title = styled.h1`
  text-align: center;
  color: ${theme.text};
`;

export const SubTitle = styled.h3`
  text-align: center;
  color: ${theme.text};
`;

export const SubTitle2 = styled.h6`
  text-align: center;
  color: ${theme.text};
`;
