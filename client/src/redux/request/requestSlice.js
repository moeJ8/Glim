import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pendingRequests: 0,
};

export const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload;
    },
    decrementPendingRequests: (state) => {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
    },
  },
});

export const { setPendingRequests, decrementPendingRequests } = requestSlice.actions;

export default requestSlice.reducer; 