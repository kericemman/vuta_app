const { getAppSecurityConfig } = require("../utils/appSecurityConfig");

const getAppConfig = (req, res) => {
  const security = getAppSecurityConfig();

  res.json({
    success: true,
    data: {
      security,
    },
  });
};

module.exports = {
  getAppConfig,
};
