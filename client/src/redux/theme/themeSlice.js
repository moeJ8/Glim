import { createSlice } from "@reduxjs/toolkit";

const initialState = { 
    theme: "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === "light" ? "dark" : "light";
        },
    }
});

// export actions
export const { toggleTheme } = themeSlice.actions;

// export reducer
export default themeSlice.reducer