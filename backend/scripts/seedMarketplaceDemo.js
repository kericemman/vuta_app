const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("../src/config/db");
const ProviderProfile = require("../src/models/ProviderProfile");
const Service = require("../src/models/Service");
const User = require("../src/models/User");
const { ROLES } = require("../src/constants/roles");
const { SERVICE_MODES } = require("../src/constants/serviceModes");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DEFAULT_COUNT = 100;
const DEMO_EMAIL_DOMAIN = "vuta.test";
const DEMO_PASSWORD = "VutaSmoke123!";

const categories = [
  {
    value: "Hair",
    specialties: ["Hair Stylist", "Braids Expert", "Natural Hair Artist"],
    serviceNames: ["Silk Press", "Knotless Braids", "Wig Install", "Wash and Style"],
    basePrice: 2200,
    duration: 90,
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    value: "Nails",
    specialties: ["Nail Technician", "Gel Specialist", "Nail Artist"],
    serviceNames: ["Gel Manicure", "Acrylic Full Set", "Pedicure", "Nail Art Set"],
    basePrice: 1200,
    duration: 60,
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    value: "Makeup",
    specialties: ["Makeup Artist", "Bridal MUA", "Soft Glam Artist"],
    serviceNames: ["Soft Glam", "Full Glam Makeup", "Bridal Trial", "Photoshoot Glam"],
    basePrice: 2500,
    duration: 75,
    images: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    value: "Spa",
    specialties: ["Spa Therapist", "Facialist", "Massage Therapist"],
    serviceNames: ["Deep Tissue Massage", "Glow Facial", "Body Scrub", "Aromatherapy"],
    basePrice: 3000,
    duration: 80,
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    value: "Barber",
    specialties: ["Barber", "Grooming Expert", "Beard Specialist"],
    serviceNames: ["Signature Cut", "Beard Trim", "Fade and Lineup", "Hot Towel Shave"],
    basePrice: 900,
    duration: 45,
    images: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const locations = [
  { area: "Kilimani", city: "Nairobi", country: "Kenya", latitude: -1.2921, longitude: 36.7869 },
  { area: "Westlands", city: "Nairobi", country: "Kenya", latitude: -1.2672, longitude: 36.8061 },
  { area: "Ruiru", city: "Kiambu", country: "Kenya", latitude: -1.1464, longitude: 36.9606 },
  { area: "Nyali", city: "Mombasa", country: "Kenya", latitude: -4.0435, longitude: 39.6682 },
  { area: "Ikoyi", city: "Lagos", country: "Nigeria", latitude: 6.4541, longitude: 3.4246 },
  { area: "Osu", city: "Accra", country: "Ghana", latitude: 5.5557, longitude: -0.1826 },
  { area: "Sandton", city: "Johannesburg", country: "South Africa", latitude: -26.1076, longitude: 28.0567 },
  { area: "Kacyiru", city: "Kigali", country: "Rwanda", latitude: -1.9367, longitude: 30.0914 },
];

const firstNames = [
  "Amina",
  "Tola",
  "Bimpe",
  "Sarah",
  "Nia",
  "Zainab",
  "Kemi",
  "Amara",
  "Lerato",
  "Malaika",
  "Imani",
  "Wanjiku",
];

const businessPrefixes = [
  "Luxe",
  "Glow",
  "Velvet",
  "Aura",
  "Crown",
  "Nia",
  "Zuri",
  "Radiance",
  "Urban",
  "Bloom",
];

const businessSuffixes = [
  "Studio",
  "Collective",
  "House",
  "Lounge",
  "Atelier",
  "Bar",
  "Spa",
  "Room",
];

const pick = (items, index) => items[index % items.length];

const getRequestedCount = () => {
  const value = Number(process.env.DEMO_MARKETPLACE_COUNT);

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_COUNT;
  }

  return Math.min(Math.floor(value), 100);
};

const buildAvailability = (index) => [
  { day: "Monday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Tuesday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Wednesday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Thursday", opensAt: "09:00", closesAt: "18:00", isAvailable: true },
  { day: "Friday", opensAt: "09:00", closesAt: "19:00", isAvailable: true },
  {
    day: "Saturday",
    opensAt: index % 3 === 0 ? "08:00" : "10:00",
    closesAt: "17:00",
    isAvailable: true,
  },
  { day: "Sunday", opensAt: "", closesAt: "", isAvailable: index % 5 === 0 },
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const buildRecords = (count) => {
  const records = [];
  const slotByGroup = new Map();

  while (records.length < count) {
    for (const category of categories) {
      for (const accountKind of ["professional", "business"]) {
        if (records.length >= count) {
          break;
        }

        const groupKey = `${category.value}-${accountKind}`;
        const slot = (slotByGroup.get(groupKey) || 0) + 1;
        slotByGroup.set(groupKey, slot);

        records.push({
          accountKind,
          category,
          sequence: records.length + 1,
          slot,
        });
      }
    }
  }

  return records;
};

const buildProfileName = ({ accountKind, category, sequence, slot }) => {
  if (accountKind === "business") {
    return `${pick(businessPrefixes, sequence)} ${category.value} ${pick(
      businessSuffixes,
      slot
    )}`;
  }

  return `${pick(firstNames, sequence)} ${category.value} Pro`;
};

const upsertUser = async ({ accountKind, category, profileImage, sequence, slot }) => {
  const providerCode = `${slugify(category.value)}-${accountKind}-${String(
    sequence
  ).padStart(3, "0")}`;
  const email = `smoke-marketplace-${providerCode}@${DEMO_EMAIL_DOMAIN}`;
  const phone = `+254780${String(sequence).padStart(6, "0")}`;
  const role =
    accountKind === "business"
      ? ROLES.BEAUTY_BUSINESS
      : ROLES.BEAUTY_PROFESSIONAL;
  const name = buildProfileName({
    accountKind,
    category,
    sequence,
    slot,
  });

  let user = await User.findOne({ $or: [{ email }, { phone }] }).select(
    "+password"
  );

  if (!user) {
    return User.create({
      name,
      email,
      phone,
      password: DEMO_PASSWORD,
      role,
      country: "Kenya",
      city: "Nairobi",
      area: "Kilimani",
      profileImage,
      preferences: [category.value],
      isActive: true,
      isVerified: true,
    });
  }

  user.name = name;
  user.email = email;
  user.phone = phone;
  user.password = DEMO_PASSWORD;
  user.role = role;
  user.country = "Kenya";
  user.city = "Nairobi";
  user.area = "Kilimani";
  user.profileImage = profileImage;
  user.preferences = [category.value];
  user.isActive = true;
  user.isVerified = true;
  await user.save();

  return user;
};

const upsertProvider = async ({ accountKind, category, location, profileImage, sequence, slot, user }) => {
  const businessName = buildProfileName({ accountKind, category, sequence, slot });
  const rating = Number((4.35 + ((sequence % 13) * 0.05)).toFixed(1));
  const reviewCount = 18 + ((sequence * 17) % 180);

  return ProviderProfile.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        user: user._id,
        accountType: accountKind === "business" ? "business" : "individual",
        businessName,
        bio: `${businessName} is a Vuta smoke demo ${
          accountKind === "business" ? "business" : "professional"
        } for ${category.value.toLowerCase()} bookings.`,
        categories: [category.value],
        country: location.country,
        city: location.city,
        area: location.area,
        coordinates: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        },
        serviceMode:
          sequence % 4 === 0
            ? SERVICE_MODES.HOME_SERVICE
            : sequence % 5 === 0
              ? SERVICE_MODES.PROVIDER_LOCATION
              : SERVICE_MODES.BOTH,
        portfolio: category.images.map((url, imageIndex) => ({
          url,
          publicId: `smoke/${category.value.toLowerCase()}/${sequence}-${imageIndex}`,
          caption: `${category.value} portfolio ${imageIndex + 1}`,
        })),
        averageRating: Math.min(rating, 5),
        reviewCount,
        verificationStatus: "approved",
        availability: buildAvailability(sequence),
        isActive: true,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  );
};

const upsertService = async ({ accountKind, category, provider, sequence, slot }) => {
  const serviceName = pick(category.serviceNames, slot - 1);
  const imageUrl = pick(category.images, sequence);

  return Service.findOneAndUpdate(
    {
      provider: provider._id,
      name: serviceName,
    },
    {
      $set: {
        provider: provider._id,
        name: serviceName,
        category: category.value,
        description: `${serviceName} by ${
          provider.businessName
        }, created for the Vuta marketplace smoke preview.`,
        imageUrl,
        imagePublicId: `smoke/services/${category.value.toLowerCase()}-${sequence}`,
        price:
          category.basePrice +
          (slot % 5) * 350 +
          (accountKind === "business" ? 650 : 0),
        currency: "KES",
        duration: category.duration + (slot % 3) * 15,
        isActive: true,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  );
};

const seedMarketplaceDemo = async () => {
  const count = getRequestedCount();
  const records = buildRecords(count);
  const summary = new Map();

  await connectDB();

  for (const record of records) {
    const profileImage = pick(record.category.images, record.sequence + record.slot);
    const location = pick(locations, record.sequence + record.slot);
    const user = await upsertUser({
      ...record,
      profileImage,
    });
    const provider = await upsertProvider({
      ...record,
      location,
      profileImage,
      user,
    });

    await upsertService({
      ...record,
      provider,
    });

    const summaryKey = `${record.category.value} ${record.accountKind}`;
    summary.set(summaryKey, (summary.get(summaryKey) || 0) + 1);
  }

  console.log(`Seeded ${records.length} marketplace smoke providers.`);
  console.log(`Seeded ${records.length} marketplace smoke services.`);
  console.log("Distribution:");

  for (const [group, total] of [...summary.entries()].sort()) {
    console.log(`- ${group}: ${total}`);
  }

  console.log(`Demo login password for seeded providers: ${DEMO_PASSWORD}`);
};

seedMarketplaceDemo()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
