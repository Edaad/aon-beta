// Test file to demonstrate threshold calculation functionality
// This is for testing purposes only

// Helper function to calculate rakeback percentage for threshold-based players
const calculateThresholdPercentage = (rakeAmount, thresholds) => {
    if (!thresholds || thresholds.length === 0) {
        return 0;
    }

    // Sort thresholds by start amount to ensure proper ordering
    const sortedThresholds = [...thresholds].sort((a, b) => a.start - b.start);

    // Find the applicable threshold
    for (const threshold of sortedThresholds) {
        if (rakeAmount >= threshold.start && rakeAmount <= threshold.end) {
            return threshold.percentage;
        }
    }

    // If no threshold matches, return 0
    return 0;
};

// Test scenarios
console.log('=== Threshold Calculation Tests ===');

// Test case 1: Player with rake $750 (should get 35% from first threshold)
const thresholds1 = [
    { start: 500, end: 1000, percentage: 35 },
    { start: 1000, end: 5000, percentage: 50 }
];

const rake1 = 750;
const percentage1 = calculateThresholdPercentage(rake1, thresholds1);
const rakeback1 = (rake1 * percentage1 / 100).toFixed(2);

console.log(`Player with $${rake1} rake:`);
console.log(`- Applicable percentage: ${percentage1}%`);
console.log(`- Rakeback amount: $${rakeback1}`);
console.log('');

// Test case 2: Player with rake $2500 (should get 50% from second threshold)
const rake2 = 2500;
const percentage2 = calculateThresholdPercentage(rake2, thresholds1);
const rakeback2 = (rake2 * percentage2 / 100).toFixed(2);

console.log(`Player with $${rake2} rake:`);
console.log(`- Applicable percentage: ${percentage2}%`);
console.log(`- Rakeback amount: $${rakeback2}`);
console.log('');

// Test case 3: Player with rake $300 (should get 0% - below threshold)
const rake3 = 300;
const percentage3 = calculateThresholdPercentage(rake3, thresholds1);
const rakeback3 = (rake3 * percentage3 / 100).toFixed(2);

console.log(`Player with $${rake3} rake:`);
console.log(`- Applicable percentage: ${percentage3}%`);
console.log(`- Rakeback amount: $${rakeback3}`);
console.log('');

// Test case 4: Player with rake $6000 (should get 0% - above threshold)
const rake4 = 6000;
const percentage4 = calculateThresholdPercentage(rake4, thresholds1);
const rakeback4 = (rake4 * percentage4 / 100).toFixed(2);

console.log(`Player with $${rake4} rake:`);
console.log(`- Applicable percentage: ${percentage4}%`);
console.log(`- Rakeback amount: $${rakeback4}`);
console.log('');

console.log('=== Test Complete ===');

// Sample data to demonstrate how it would work with players
const samplePlayers = [
    { nickname: 'Player1', rakebackType: 'threshold', thresholds: thresholds1 },
    { nickname: 'Player2', rakebackType: 'flat', rakeback: 40 },
    { nickname: 'Player3', rakebackType: 'threshold', thresholds: [{ start: 100, end: 2000, percentage: 25 }] }
];

const sampleExcelData = [
    { nickname: 'Player1', rake: 750 },
    { nickname: 'Player2', rake: 1200 },
    { nickname: 'Player3', rake: 800 }
];

console.log('=== Sample Processing Results ===');

sampleExcelData.forEach(excelPlayer => {
    const matchedPlayer = samplePlayers.find(p =>
        p.nickname.toLowerCase() === excelPlayer.nickname.toLowerCase()
    );

    if (matchedPlayer) {
        let rakebackPercentage;

        if (matchedPlayer.rakebackType === 'threshold' && matchedPlayer.thresholds) {
            rakebackPercentage = calculateThresholdPercentage(excelPlayer.rake, matchedPlayer.thresholds);
        } else {
            rakebackPercentage = matchedPlayer.rakeback;
        }

        const rakeback = (excelPlayer.rake * rakebackPercentage / 100).toFixed(2);

        console.log(`${excelPlayer.nickname}:`);
        console.log(`- Type: ${matchedPlayer.rakebackType}`);
        console.log(`- Rake: $${excelPlayer.rake}`);
        console.log(`- Percentage: ${rakebackPercentage}%`);
        console.log(`- Rakeback: $${rakeback}`);
        console.log('');
    }
});
