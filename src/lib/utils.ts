import dayjs from "dayjs";

export function dateString(date: Date) {
  return dayjs(date).format("hh:mm A [on] MMM D, YYYY");
};