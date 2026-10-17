import { createContext, useContext } from 'react';

export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

/** `ready` flips to true once the loader has finished and the intro may play. */
export const AppStateContext = createContext({ ready: false });
export const useAppState = () => useContext(AppStateContext);
