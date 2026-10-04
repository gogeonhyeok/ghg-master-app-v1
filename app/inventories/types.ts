export type Inventory = {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  photo: string;
};

export type CreateInventoryState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialCreateInventoryState: CreateInventoryState = {
  status: "idle",
  message: "",
};
