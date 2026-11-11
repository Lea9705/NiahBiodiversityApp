
const STATUS_CODES = {
  LC: 'LC',
  'LEAST CONCERN': 'LC',
  DD: 'DD',
  'DATA DEFICIENT': 'DD',
};

export function canViewPlantLocation(record, isBotanist = false) {
  // Botanists can see all plant locations.
  if (isBotanist) return true;

  const status = String(
    record?.conservationStatus || ''
  ).trim().toUpperCase();

  // Visitors can only see LC and DD locations.
  return (
    STATUS_CODES[status] === 'LC' ||
    STATUS_CODES[status] === 'DD'
  );
}
