export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO string e.g. 2026-10-27T09:00:00+05:30
  endDate?: string;
}

export function downloadIcsFile(event: CalendarEvent) {
  const start = new Date(event.startDate);
  const end = event.endDate
    ? new Date(event.endDate)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  const formatIcsDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/-|:|\.\d+/g, "")
      .slice(0, 15) + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SVKM NMIMS//Sports Championship 2026-27//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location.replace(/\n/g, ", ")}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `STATUS:CONFIRMED`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
