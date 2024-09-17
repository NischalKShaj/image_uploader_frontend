// <====================== file to create the zustand for global state management ========================>

// importing the required modules
import { create } from "zustand";

// creating the interfaces
interface State {
  isAuthorized: boolean;
  user: {
    _id: string;
    username: string;
    email: string;
    phone: string;
    image: string | null;
  } | null;
  isLoggedIn: (user: {
    _id: string;
    username: string;
    email: string;
    phone: string;
    image: string | null;
  }) => void;
  isLoggedOut: () => void;
}

// creating the state
export const AppState = create<State>((set, get) => {
  let initialState = {
    isAuthorized: false,
    user: null,
  };

  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      try {
        initialState = JSON.parse(savedState);
      } catch (error) {
        console.error("error parsing the state", error);
      }
    }
  }

  return {
    ...initialState,
    isLoggedIn: (user) => {
      set({ isAuthorized: true, user });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "appState",
          JSON.stringify({ ...get(), isAuthorized: true, user })
        );
      }
    },
    isLoggedOut: () => {
      set({ isAuthorized: false, user: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("appState");
      }
    },
  };
});
