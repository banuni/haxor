const algorithmNames = ["alpha", "beta", "gamma", "delta"] as const;

const mapping: Record<
  (typeof algorithmNames)[number],
  { secondsToComplete: number; probability: number }
> = {
  alpha: { secondsToComplete: 5, probability: 0.5 },
  beta: { secondsToComplete: 8, probability: 0.8 },
  gamma: { secondsToComplete: 9, probability: 0.1 },
  delta: { secondsToComplete: 12, probability: 0.9 },
};

const getTargetBonuses = (targetName: string): [number, number] => {
  if (targetName.toLowerCase().startsWith("budner")) {
    return [5, -0.1];
  }
  if (targetName.toLowerCase().startsWith("nuni")) {
    return [-2, 0.05];
  }
  return [0, 0];
};

const getAlgorithmResult = (algorithmName: string, targetName: string) => {
  const [bonus, bonusProbability] = getTargetBonuses(targetName);
  if (
    !algorithmNames.includes(algorithmName as (typeof algorithmNames)[number])
  ) {
    return { secondsToComplete: 0, probability: 0 };
  }
  const { secondsToComplete, probability } =
    mapping[algorithmName as (typeof algorithmNames)[number]];
  return {
    secondsToComplete: secondsToComplete + bonus,
    probability: probability + bonusProbability,
  };
};

export { getAlgorithmResult };
