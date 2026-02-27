import { useReducer } from "react";
import { DEFAULT_STATE, type BuilderState, type CardType } from "../constants/defaults";

type Action =
  | { type: "SET_USERNAME"; value: string }
  | { type: "SET_CARD_TYPE"; value: CardType }
  | { type: "SET_THEME"; value: string }
  | { type: "SET_FIELD"; field: keyof BuilderState; value: string | number | boolean };

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "SET_USERNAME":
      return { ...state, username: action.value };
    case "SET_CARD_TYPE":
      return { ...state, cardType: action.value };
    case "SET_THEME":
      return { ...state, theme: action.value };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

export function useBuilderState() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  const setUsername = (value: string) => dispatch({ type: "SET_USERNAME", value });
  const setCardType = (value: CardType) => dispatch({ type: "SET_CARD_TYPE", value });
  const setTheme = (value: string) => dispatch({ type: "SET_THEME", value });
  const setField = (field: keyof BuilderState, value: string | number | boolean) =>
    dispatch({ type: "SET_FIELD", field, value });

  return { state, setUsername, setCardType, setTheme, setField };
}
