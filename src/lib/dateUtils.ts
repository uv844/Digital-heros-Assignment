import { startOfMonth, addMonths, setDate, getDay, addDays, isAfter, startOfDay } from 'date-fns';

/**
 * Calculates the first Friday of a given month and year.
 */
export const getFirstFridayOfMonth = (date: Date): Date => {
  const firstDayOfMonth = startOfMonth(date);
  const dayOfWeek = getDay(firstDayOfMonth); // 0 (Sun) to 6 (Sat)
  
  // Friday is 5
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  
  return addDays(firstDayOfMonth, daysUntilFriday);
};

/**
 * Calculates the next draw date based on the "first Friday of each month" rule.
 */
export const getNextDrawDate = (currentDate: Date = new Date()): Date => {
  const firstFridayThisMonth = getFirstFridayOfMonth(currentDate);
  
  // If today is after the first Friday of this month, the next draw is next month
  if (isAfter(startOfDay(currentDate), startOfDay(firstFridayThisMonth))) {
    return getFirstFridayOfMonth(addMonths(currentDate, 1));
  }
  
  return firstFridayThisMonth;
};
