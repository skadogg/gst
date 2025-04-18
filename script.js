function getDSTStartDate(year) {
    // Rule for US DST: Second Sunday in March
    const march = new Date(year, 2, 1); // Month is 0-indexed (0 for January)
    const firstSunday = new Date(march.setDate(march.getDate() + (7 - march.getDay()) % 7));
    const dstStart = new Date(firstSunday.setDate(firstSunday.getDate() + 7));
    return dstStart;
}

function getDSTEndDate(year) {
    // Rule for US DST: First Sunday in November
    const november = new Date(year, 10, 1); // Month is 0-indexed (0 for January)
    const firstSunday = new Date(november.setDate(november.getDate() + (7 - november.getDay()) % 7));
    const dstEnd = firstSunday;
    dstEnd.setHours(2, 0, 0, 0); // DST ends at 2:00 AM
    return dstEnd;
}

function calculateModifiedTime() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const dstStartDate = getDSTStartDate(currentYear);
    const dstEndDate = getDSTEndDate(currentYear);
    const startOfYear = new Date(currentYear, 0, 1); // January 1st
    const nextYearDSTStart = getDSTStartDate(currentYear + 1);
    const endOfYear = new Date(currentYear, 11, 31); // December 31st

    if (now >= dstStartDate && now < dstEndDate) {
        const timeInDST = now - dstStartDate;
        const totalDSTDuration = dstEndDate - dstStartDate;
        const percentagePassedInDST = (timeInDST / totalDSTDuration) * 100;
        const adjustmentMilliseconds = (percentagePassedInDST / 100) * 60 * 60 * 1000;

        const modifiedTime = new Date(now.getTime() - adjustmentMilliseconds);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
        return { time: modifiedTime.toLocaleTimeString(undefined, options), percentage: percentagePassedInDST };
    } else if (now < dstStartDate) {
        const timeUntilDST = dstStartDate - now;
        const totalTimeToDST = dstStartDate - startOfYear;
        const percentageTowardsDST = 100 - ((timeUntilDST / totalTimeToDST) * 100);

        const adjustmentMilliseconds = (percentageTowardsDST / 100) * 60 * 60 * 1000;

        const modifiedTime = new Date(now.getTime() + adjustmentMilliseconds);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
        return { time: modifiedTime.toLocaleTimeString(undefined, options), percentage: percentageTowardsDST };
    } else { // Now is after DST end date
        const timeSinceDSTEnd = now - dstEndDate;
        const totalTimeToNextDST = nextYearDSTStart - dstEndDate;
        const percentageTowardsNextDST = (timeSinceDSTEnd / totalTimeToNextDST) * 100;

        // Ensure percentage doesn't go beyond 100 (though it shouldn't within the current year)
        const cappedPercentage = Math.min(percentageTowardsNextDST, 100);

        const adjustmentMilliseconds = (cappedPercentage / 100) * 60 * 60 * 1000;

        const modifiedTime = new Date(now.getTime() + adjustmentMilliseconds);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
        return { time: modifiedTime.toLocaleTimeString(undefined, options), percentage: cappedPercentage };
    }
}

function updateModifiedTimeDisplay() {
    const result = calculateModifiedTime();
    document.getElementById('modified-time').innerText = result.time;
    document.getElementById('percentage-bar').style.width = `${result.percentage}%`;
}

// Update the time display every 5 seconds
setInterval(updateModifiedTimeDisplay, 1000);

// Initial update when the page loads
updateModifiedTimeDisplay();