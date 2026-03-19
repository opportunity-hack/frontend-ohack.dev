import React, { createContext, useContext, useReducer, useEffect } from "react";

const CART_STORAGE_KEY = "ohack_store_cart";

const initialState = {
  items: [],
  total: 0,
};

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartReducer(state, action) {
  let newItems;

  switch (action.type) {
    case "ADD_ITEM": {
      const { id, selectedVariations } = action.payload;
      const variationKey = selectedVariations
        ? JSON.stringify(selectedVariations)
        : "";
      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === id &&
          JSON.stringify(item.selectedVariations || {}) === variationKey
      );

      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ];
      }

      return { items: newItems, total: calculateTotal(newItems) };
    }

    case "REMOVE_ITEM": {
      const { id, selectedVariations } = action.payload;
      const variationKey = selectedVariations
        ? JSON.stringify(selectedVariations)
        : "";
      newItems = state.items.filter(
        (item) =>
          !(
            item.id === id &&
            JSON.stringify(item.selectedVariations || {}) === variationKey
          )
      );
      return { items: newItems, total: calculateTotal(newItems) };
    }

    case "UPDATE_QUANTITY": {
      const { id, selectedVariations, quantity } = action.payload;
      const variationKey = selectedVariations
        ? JSON.stringify(selectedVariations)
        : "";

      if (quantity <= 0) {
        newItems = state.items.filter(
          (item) =>
            !(
              item.id === id &&
              JSON.stringify(item.selectedVariations || {}) === variationKey
            )
        );
      } else {
        newItems = state.items.map((item) =>
          item.id === id &&
          JSON.stringify(item.selectedVariations || {}) === variationKey
            ? { ...item, quantity }
            : item
        );
      }

      return { items: newItems, total: calculateTotal(newItems) };
    }

    case "CLEAR_CART":
      return { items: [], total: 0 };

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
}

const ShoppingCartContext = createContext(null);

export function ShoppingCartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.items)) {
          dispatch({ type: "LOAD_CART", payload: parsed });
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore localStorage errors
    }
  }, [state]);

  const addItem = (item) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (id, selectedVariations) =>
    dispatch({ type: "REMOVE_ITEM", payload: { id, selectedVariations } });
  const updateQuantity = (id, selectedVariations, quantity) =>
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id, selectedVariations, quantity },
    });
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShoppingCartContext.Provider
      value={{
        items: state.items,
        total: state.total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error("useShoppingCart must be used within a ShoppingCartProvider");
  }
  return context;
}
