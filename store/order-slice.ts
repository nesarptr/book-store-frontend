import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookCart } from "./cartSlice";

export interface OrderModel {
  readonly id: string;
  cart: BookCart[];
  totalPrice: number;
  isPaid: boolean;
}

const initialState: { order: OrderModel[] } = {
  order: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    populate: (state, { payload: orderItems }: PayloadAction<OrderModel[]>) => {
      state.order = orderItems;
    },
    changeStatus: (state, { payload: orderId }: PayloadAction<string>) => {
      const orderItemInd = state.order.findIndex(
        (order) => order.id == orderId
      );
      state.order[orderItemInd].isPaid = true;
    },
  },
});

export const { populate, changeStatus } = orderSlice.actions;

export default orderSlice.reducer;
