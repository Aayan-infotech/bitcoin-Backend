exports.convertSecondsToDuration=(seconds)=> {
    if (seconds <= 0) return "0m";

    const hours = Math.floor(seconds / 3600);  // Get total hours
    const minutes = Math.floor((seconds % 3600) / 60); // Get remaining minutes
    const secs = seconds % 60;  // Get remaining seconds

    let duration = "";
    if (hours > 0) duration += `${hours}h `;
    if (minutes > 0) duration += `${minutes}m `;
    if (hours === 0 && minutes === 0 && secs > 0) duration += `${secs}s`;

    return duration.trim(); // Remove extra space at the end
}
