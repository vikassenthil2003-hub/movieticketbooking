/**
 * Standardized Date & Showtime Utility for CineVerse AI Frontend
 * Mirrors BookMyShow dynamic date tabs, timezone awareness (Asia/Kolkata),
 * and chronological showtime filtering.
 */

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current timestamp and date parts in target timezone (default: Asia/Kolkata).
 * @param {string} timeZone
 * @returns {{ dateStr: string, hour: number, minute: number, currentMinutes: number, timeZone: string, isoString: string }}
 */
export const getNowInTimezone = (timeZone = DEFAULT_TIMEZONE) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const year = map.year;
  const month = String(map.month).padStart(2, '0');
  const day = String(map.day).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(map.minute, 10);
  const currentMinutes = hour * 60 + minute;

  return {
    dateStr,
    hour,
    minute,
    currentMinutes,
    timeZone,
    isoString: now.toISOString(),
  };
};

/**
 * Returns a local date string in YYYY-MM-DD format with optional day offset in target timezone.
 * @param {number} offsetDays
 * @param {Date|string|number} baseDate
 * @param {string} timeZone
 * @returns {string}
 */
export const getLocalDateString = (offsetDays = 0, baseDate = new Date(), timeZone = DEFAULT_TIMEZONE) => {
  const d = new Date(baseDate);
  if (isNaN(d.getTime())) {
    return getNowInTimezone(timeZone).dateStr;
  }

  // Format base date in target timezone to extract its local Y-M-D
  const baseParts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

  const [y, m, day] = baseParts.split('-').map(Number);
  const targetDate = new Date(Date.UTC(y, m - 1, day + offsetDays, 12, 0, 0));

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(targetDate);
};

/**
 * Converts 12-hr or 24-hr time string to minutes since midnight (0-1439).
 * @param {string} timeStr
 * @returns {number}
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const trimmed = timeStr.trim().toUpperCase();

  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const modifier = match12[3];

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
};

/**
 * Comparator for sorting showtimes chronologically.
 * @param {string} aTime
 * @param {string} bTime
 * @returns {number}
 */
export const compareShowtimes = (aTime, bTime) => {
  return timeToMinutes(aTime) - timeToMinutes(bTime);
};

/**
 * Checks if a show on showDate has already started or completed in target timezone.
 * @param {string} showDate
 * @param {string} startTime
 * @param {string} timeZone
 * @returns {boolean}
 */
export const isShowInPast = (showDate, startTime, timeZone = DEFAULT_TIMEZONE) => {
  const { dateStr: todayStr, currentMinutes } = getNowInTimezone(timeZone);
  if (showDate < todayStr) return true;
  if (showDate > todayStr) return false;
  return timeToMinutes(startTime) <= currentMinutes;
};

/**
 * Checks if a date string 'YYYY-MM-DD' is before today in target timezone.
 * @param {string} dateStr
 * @param {string} timeZone
 * @returns {boolean}
 */
export const isDateInPast = (dateStr, timeZone = DEFAULT_TIMEZONE) => {
  if (!dateStr) return false;
  const { dateStr: todayStr } = getNowInTimezone(timeZone);
  return dateStr < todayStr;
};

/**
 * Generates an array of dynamic date tab objects for Today, Tomorrow, Day After Tomorrow, and upcoming dates.
 * Matches BookMyShow horizontal date bar with day number, month, and day name.
 * @param {number} count
 * @param {Date|string} baseDate
 * @param {string} timeZone
 * @returns {Array<{dateStr: string, dayName: string, shortDayName: string, dayNum: string, monthName: string, formattedDate: string, isToday: boolean, isTomorrow: boolean, isDayAfter: boolean}>}
 */
export const getDynamicDateTabs = (count = 7, baseDate = new Date(), timeZone = DEFAULT_TIMEZONE) => {
  const { dateStr: todayStr } = getNowInTimezone(timeZone);
  const [ty, tm, tday] = todayStr.split('-').map(Number);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(ty, tm - 1, tday + i, 12, 0, 0));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const parts = formatter.formatToParts(d);
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const dateStr = getLocalDateString(i, baseDate, timeZone);
    const dayName =
      i === 0
        ? 'TODAY'
        : i === 1
        ? 'TOMORROW'
        : i === 2
        ? 'DAY AFTER TOMORROW'
        : (map.weekday ? map.weekday.toUpperCase() : 'DAY');

    const shortDayName =
      i === 0
        ? 'TODAY'
        : i === 1
        ? 'TOMORROW'
        : i === 2
        ? 'DAY AFTER'
        : (map.weekday ? map.weekday.toUpperCase() : '');

    const formattedDate = `${map.day} ${map.month}`;

    return {
      dateStr,
      dayName,
      shortDayName,
      dayNum: map.day,
      monthName: map.month,
      formattedDate,
      isToday: i === 0,
      isTomorrow: i === 1,
      isDayAfter: i === 2,
    };
  });
};

/**
 * Formats a date string 'YYYY-MM-DD' into human-readable display like 'Today, 14 Oct' or 'Wed, 14 Oct 2026'
 * @param {string} dateStr
 * @param {string} timeZone
 * @returns {string}
 */
export const formatDisplayDate = (dateStr, timeZone = DEFAULT_TIMEZONE) => {
  if (!dateStr) return '';
  const today = getLocalDateString(0, new Date(), timeZone);
  const tomorrow = getLocalDateString(1, new Date(), timeZone);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return d.toLocaleDateString('en-US', { timeZone, weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
};
