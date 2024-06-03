import dayjs from "dayjs";

export function dateString(date: Date) {
  return dayjs(date).format("hh:mm A [on] MMM D, YYYY");
};

export function dateSimpleString(date: Date) {
  return dayjs(date).format("HH:mm MM/DD/YYYY");
}