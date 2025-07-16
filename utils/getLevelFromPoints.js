const levelThresholds = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const getLevelFromPoints = (totalPoints) => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i]) return i + 1;
  }
  return 1;
};

const getLevelProgress = (totalPoints) => {
  const level = getLevelFromPoints(totalPoints);
  const currentThreshold = levelThresholds[level - 1] || 0;
  const nextThreshold = levelThresholds[level] || currentThreshold;

  const pointsInLevel = totalPoints - currentThreshold;
  const levelRange = nextThreshold - currentThreshold || 1;
  const progressPercent = Math.min((pointsInLevel / levelRange) * 100, 100);
  const pointsToNextLevel = Math.max(nextThreshold - totalPoints, 0);

  return {
    level,
    progressPercent: Math.round(progressPercent),
    pointsToNextLevel,
    totalPoints,
  };
};

module.exports = { getLevelFromPoints, getLevelProgress };
