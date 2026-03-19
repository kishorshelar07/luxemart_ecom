import { configureStore } from '@reduxjs/toolkit';
import { authReducer, cartReducer, wishlistReducer, productReducer, uiReducer } from './slices/index';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
