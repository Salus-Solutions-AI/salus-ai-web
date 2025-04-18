export function parseDate(dateString: string): Date {
    if (dateString === "" || dateString === "Unknown") {
        return new Date(0);
    }

    const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const date = new Date(cleanedDateString);
    
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${dateString}`);
    }
    
    return date;
}