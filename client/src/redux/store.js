import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from '../redux/user/userSlice'; // ✅ Correct import
import themeReducer from '../redux/theme/themeSlice';
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import requestReducer from './request/requestSlice';
import reportReducer from './report/reportSlice';


const rootReducer = combineReducers({
  user: userReducer, // ✅ Correct usage
  theme: themeReducer,
  request: requestReducer,
  report: reportReducer,
});

const persistconfig = {
  key: 'root',
  storage,
  version: 1,
}

const persistedReducer = persistReducer(persistconfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export const persistor = persistStore(store);

// Expose store for use in non-React contexts (like visibility change handler)
window.store = store;

