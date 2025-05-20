import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCart } from "@/redux/features/cart-slice";
import { AppDispatch, RootState } from "@/redux/store";

export default function CartLoader() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.authReducer.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserCart());
    }
  }, [isLoggedIn, dispatch]);

  return null;
}
