import { resolveAuthor } from "./authors";

test("uses the Google display name before a broad anonymous region", () => {
  expect(resolveAuthor("  Alex Tan  ", "Tampines")).toBe("Alex Tan");
  expect(resolveAuthor(null, "Bukit Panjang")).toBe("Someone from the west");
  expect(resolveAuthor(null, "Jurong West")).toBe("Someone from the west");
  expect(resolveAuthor(null, "Woodlands")).toBe("Someone from the north");
  expect(resolveAuthor(null, "Yishun")).toBe("Someone from the north");
  expect(resolveAuthor(null, "Bedok")).toBe("Someone from the east");
  expect(resolveAuthor(null, "Punggol")).toBe("Someone from the north-east");
  expect(resolveAuthor(null, "Bishan")).toBe("Someone from central Singapore");
  expect(resolveAuthor(" ", null)).toBe("Wanderer");
  expect(resolveAuthor(null, "Unknown estate")).toBe("Wanderer");
  expect(resolveAuthor(null, "toString")).toBe("Wanderer");
});
