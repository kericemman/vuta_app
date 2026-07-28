const pick = (source, allowedFields) =>
  allowedFields.reduce((values, field) => {
    if (source[field] !== undefined) {
      values[field] = source[field];
    }

    return values;
  }, {});

module.exports = pick;
