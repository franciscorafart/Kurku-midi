import styled from "styled-components";
import theme from "config/theme";
import { Plus, XLg, Gear } from "react-bootstrap-icons";

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const EffectConnect = styled.div`
  display: flex;
`;

export const EmptyEffectContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  width: 120px;
  padding: 8px;
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
  background-color: ${theme.background2};
  gap: 6px;
`;

export const OptionsContainer = styled.div`
  flex: 3;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const EffectBox = styled.div`
  flex: 9;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-content: flex-start;
  color: ${theme.text2};
  gap: 6px;
`;

export const EffectData = styled.div`
  font-size: 0.6em;
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
  margin: 0;
`;

export const SubTitle2 = styled.h6`
  text-align: flex-start;
  color: ${theme.text};
  margin: 0;
`;

export const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ColumnItem = styled.div`
  display: flex;
  flex-direction: column;
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
  userId: string;
  date: string;
  expiry: string;
};

export const Icons = styled.div`
  display: flex;
  gap: 4px;
`;

export const PlusButton = styled(Plus)`
  cursor: pointer;
`;

export const CloseButton = styled(XLg)`
  cursor: pointer;
  color: white;
`;

export const GearButton = styled(Gear)`
  cursor: pointer;
`;
