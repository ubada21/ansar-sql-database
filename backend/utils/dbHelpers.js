
exports.convertDecimalFields = (row) => {
  if (!row) return row;
  return {
    ...row,
    AMOUNT: row.AMOUNT ? parseFloat(row.AMOUNT) : null
  };
};

exports.convertDecimalFieldsForDonor = (row) => {
  if (!row) return row;
  return {
    ...row,
    AMOUNT_DONATED: row.AMOUNT_DONATED ? parseFloat(row.AMOUNT_DONATED) : null
  };
};

