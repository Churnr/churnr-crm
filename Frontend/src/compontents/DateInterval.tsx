import { addDays } from 'date-fns'
import { addMonths } from 'date-fns'
import { isWithinInterval } from 'date-fns'
import { getMonth } from 'date-fns'
import { getYear } from 'date-fns'

const GetMonthAndYear = (date: Date | number) => {
    const givinMonth = getMonth(date);
    const givingYear = getYear(date);
    const firstOfMonth = new Date(givingYear, givinMonth, 1);
    return firstOfMonth
}

const ExtraDaysFunction = (date: number | Date, days: number) => {
    const getMonthAndYearFromGivin = GetMonthAndYear(date);
    const endMonth = addMonths(date, 1);
    const getMonthAndYearFromend = GetMonthAndYear(endMonth);
    const givinPlusDays = addDays(getMonthAndYearFromGivin, days);
    const endPlusDays = addDays(getMonthAndYearFromend, days);
    
    return [givinPlusDays, endPlusDays]
}

 const DaysBetweenGivingDate = (objectDate: Date, date: number | Date, days: number) => {
    const [start, end] = ExtraDaysFunction(date, days);
    return isWithinInterval(objectDate,  {
        start: start,
        end: end})
}

export default function NewDataFromDateInterval(data: any, date: Date) {
    const newList = [];

    data.map((row, index) => {
    const createdDate = new Date(row?.created);
    //Skal være 3 for at give fra den 4 til den 4
    if (DaysBetweenGivingDate(createdDate, date, 3) === true) {
      newList.push(row);
    }
    
  })
  return newList;
}