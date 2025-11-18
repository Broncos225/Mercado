import { FieldValue, Timestamp } from "firebase/firestore";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  plannedValue: number;
  actualValue: number;
  purchased: boolean;
  createdAt: FieldValue | Timestamp;
};
