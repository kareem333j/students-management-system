import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge"
import relativeTime from "dayjs/plugin/relativeTime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

dayjs.extend(relativeTime);
dayjs.locale("ar");
export const formatDate = (dateString: string) => {
  const date = dayjs(dateString);
  const now = dayjs();

  if (now.diff(date, "minute") < 1) return "الآن";

  if (now.diff(date, "day") < 1) return date.fromNow();

  return date.format("dddd [الساعة] h:mm A");
};

