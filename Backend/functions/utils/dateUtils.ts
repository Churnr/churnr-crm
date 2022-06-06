import {addDays, addMonths, getMonth, getYear} from "date-fns";

const getMonthAndYear = (date: Date | number) => {
  const givinMonth = getMonth(date);
  const givingYear = getYear(date);
  const firstOfMonth = new Date(givingYear, givinMonth, 1);
  return firstOfMonth;
};

export const extraDaysFunction = (date: number | Date, startDays: number, endDays: number) => {
  const getMonthAndYearFromGivin = getMonthAndYear(date);
  const endMonth = addMonths(date, -1);
  const getMonthAndYearFromend = getMonthAndYear(endMonth);
  const givinPlusDays = addDays(getMonthAndYearFromGivin, startDays);
  const endPlusDays = addDays(getMonthAndYearFromend, endDays);

  return [givinPlusDays, endPlusDays];
};

