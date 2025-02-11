import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/user/userSlice'; // ✅ Correct import

export const store = configureStore({
  reducer: {
    user: userReducer, // ✅ Correct usage
  },
});

