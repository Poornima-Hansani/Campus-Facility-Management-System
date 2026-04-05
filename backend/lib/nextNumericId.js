async function nextNumericId(Model) {
  const last = await Model.findOne()
    .sort({ numericId: -1 })
    .select("numericId")
    .lean();
  return (last?.numericId ?? 0) + 1;
}

module.exports = { nextNumericId };
