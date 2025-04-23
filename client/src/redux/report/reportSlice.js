import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pendingReports: 0,
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setPendingReports: (state, action) => {
      state.pendingReports = action.payload;
    },
    decrementPendingReports: (state) => {
      state.pendingReports = Math.max(0, state.pendingReports - 1);
    },
  },
});

export const { setPendingReports, decrementPendingReports } = reportSlice.actions;

export default reportSlice.reducer; 