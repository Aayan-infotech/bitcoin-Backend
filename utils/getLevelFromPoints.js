const levelThresholds = [0, 10, 20, 30, 40, 50, 60, 70,80,90,100];

const getLevelFromPoints = (totalPoints) => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= levelThresholds[i]) return i + 1;
  }
  return 1;
};

module.exports = { getLevelFromPoints };
