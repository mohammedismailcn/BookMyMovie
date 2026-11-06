// Independent presentation demo. Never used as booking inventory.
export const previewSeats = ["E", "D", "C"].flatMap((row) => Array.from({ length: 8 }, (_, index) => ({
  id: `${row}${index + 1}`,
  row,
  number: index + 1,
  reserved: ["E3", "E4", "D2", "C7"].includes(`${row}${index + 1}`),
  vip: row === "E",
  price: row === "E" ? 900 : 600,
})));
