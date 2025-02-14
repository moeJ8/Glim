import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from '../redux/user/userSlice'; // ✅ Correct import
import themeReducer from '../redux/theme/themeSlice';
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'


const rootReducer = combineReducers({
  user: userReducer, // ✅ Correct usage
  theme: themeReducer,
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

