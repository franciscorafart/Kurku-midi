import styled from "styled-components";
import theme from "config/theme";

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
`;

export const EffectConnect = styled.div`
  display: flex;
`;

export const EmptyEffectContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
  width: 200px;
  padding: 0 8px 8px 8px;
  border: 1px dashed ${theme.notSelecteble};
  color: ${theme.text};
  border-radius: 5px;
`;

export const EffectContainer = styled(EmptyEffectContainer)<{
  selected?: boolean;
  selectable: boolean;
}>`
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid
    ${({ selected, selectable }) =>
      selectable
        ? selected
          ? theme.selected
          : theme.selectable
        : theme.notSelecteble};
  background-color: ${theme.background3};
  gap: 6px;
`;

export const CloseContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
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
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: flex-start;
  cursor: ${({ selectable }) => (selectable ? "pointer" : "auto")};
  color: ${theme.text2};
  gap: 6px;
`;

export const EffectData = styled.div`
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

export const fetchBodyBase = {
  method: "POST",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json",
  },
  redirect: "follow",
  referrerPolicy: "no-referrer",
  body: "",
};

export type TransactionResponse = {
  walletId: string;
  date: string;
  expiry: string;
};
