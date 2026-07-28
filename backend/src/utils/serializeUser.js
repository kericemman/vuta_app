const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  country: user.country,
  city: user.city,
  area: user.area,
  profileImage: user.profileImage,
  preferences: user.preferences || [],
  isVerified: user.isVerified,
  isActive: user.isActive,
});

module.exports = serializeUser;
