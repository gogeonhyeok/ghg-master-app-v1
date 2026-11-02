jest.mock("./actions", () => ({ createInventory: jest.fn() }));

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import InventoryForm from "./InventoryForm";
import { createInventory } from "./actions";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
beforeEach(() => {
  let counter = 0;
  URL.createObjectURL = jest.fn(() => `blob:inventory-${++counter}`);
  URL.revokeObjectURL = jest.fn();
  jest.mocked(createInventory).mockResolvedValue({ status: "success", message: "Inventory added." });
});

function mockDecodedImage() {
  jest.spyOn(window, "Image").mockImplementation(() => {
    const img = document.createElement("img");
    img.width = 2000;
    img.height = 1000;
    Object.defineProperty(img, "src", {
      set() { queueMicrotask(() => img.dispatchEvent(new Event("load"))); },
    });
    return img;
  });
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

test("compresses a photo larger than the previous 512 KB limit before uploading", async () => {
  mockDecodedImage();
  const drawImage = jest.fn();
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
  const photo = new Blob(["compressed image"], { type: "image/jpeg" });
  const encode = jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(photo));
  const { container } = render(<InventoryForm />);
  const fileInput = screen.getByLabelText(/Photo/);
  fireEvent.change(fileInput, { target: { files: [new File([new Uint8Array(700000)], "camera.jpg", { type: "image/jpeg" })] } });

  await waitFor(() => expect(screen.getByAltText("Selected inventory preview")).toHaveAttribute("src", "blob:inventory-2"));
  expect(container.querySelector('input[name="photo"]')).toBeNull();
  expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 0, 0, 1280, 640);
  expect(encode).toHaveBeenCalledWith(expect.any(Function), "image/jpeg", 0.7);
  expect(fileInput).toHaveAttribute("capture", "environment");
  fireEvent.input(screen.getByLabelText("Name"), { target: { value: "Camera" } });
  fireEvent.input(screen.getByLabelText("Description"), { target: { value: "Studio camera" } });
  fireEvent.submit(container.querySelector("form")!);
  await waitFor(() => expect(createInventory).toHaveBeenCalled());
  const upload = jest.mocked(createInventory).mock.calls[0][1].get("photo") as File;
  expect(upload).toBeInstanceOf(File);
  expect(upload.type).toBe("image/jpeg");
  expect(upload.size).toBe(photo.size);
  await waitFor(() => expect(screen.queryByAltText("Selected inventory preview")).toBeNull());
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:inventory-1");
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:inventory-2");
});

test("reports a compression failure and allows another file selection", async () => {
  mockDecodedImage();
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<InventoryForm />);
  const fileInput = screen.getByLabelText(/Photo/);
  fireEvent.change(fileInput, { target: { files: [new File(["photo"], "camera.jpg", { type: "image/jpeg" })] } });

  await waitFor(() => expect(screen.getByRole("alert", { hidden: true })).toHaveTextContent("This photo could not be processed."));
  expect(fileInput).toBeEnabled();
});

test.each([null, new Blob([new Uint8Array(2 * 1024 * 1024 + 1)], { type: "image/jpeg" })])(
  "does not accept an empty compression result or an oversized blob", async (blob) => {
    mockDecodedImage();
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: jest.fn() } as unknown as CanvasRenderingContext2D);
    jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(blob));
    render(<InventoryForm />);
    fireEvent.change(screen.getByLabelText(/Photo/), { target: { files: [new File(["photo"], "camera.jpg", { type: "image/jpeg" })] } });
    await waitFor(() => expect(screen.getByRole("alert", { hidden: true })).toBeInTheDocument());
    expect(screen.queryByAltText("Selected inventory preview")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:inventory-1");
  },
);
