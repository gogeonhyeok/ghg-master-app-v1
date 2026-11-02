export const jobDateFormat = new Intl.DateTimeFormat("en-SG", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore",
});
export const compactJobDateFormat = new Intl.DateTimeFormat("en-SG", {
  day: "numeric", month: "short", timeZone: "Asia/Singapore",
});
export const fullJobDateFormat = new Intl.DateTimeFormat("en-SG", {
  dateStyle: "long", timeZone: "Asia/Singapore",
});
