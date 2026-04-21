const ranksWithoutForceNumber = [
  "S/SGT",
  "A/INSP",
  "INSP",
  "ASP",
  "SP",
  "SSP",
];

export function formatOfficerName(officer) {
  const rank = officer.rank?.trim().toUpperCase();
  const fullName = officer.fullName?.trim().toUpperCase();
  const forceNumber = officer.forceNumber?.trim().toUpperCase();

  if (ranksWithoutForceNumber.includes(rank)) {
    return `${rank} ${fullName}`;
  }

  return `${forceNumber} ${rank} ${fullName}`;
}