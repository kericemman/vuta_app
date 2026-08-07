import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { DashboardCard } from "../../src/components/DashboardCard";
import { LogoLoader } from "../../src/components/BrandLogo";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import {
  businessSpecializationSuggestions,
  defaultAvailability,
} from "../../src/constants/provider";
import { colors, radii, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import {
  createBusinessEmployee,
  deactivateBusinessEmployee,
  getMyProviderProfileStatus,
  listBusinessEmployees,
  listMyServices,
  uploadBusinessEmployeeImage,
  updateBusinessEmployee,
} from "../../src/services/provider.service";
import {
  BusinessEmployee,
  BusinessEmployeeRole,
  BusinessEmployeeStatus,
  ProviderAvailability,
} from "../../src/types/provider";
import { getGridItemPercentWidth } from "../../src/utils/responsiveGrid";

const roleOptions: Array<{ label: string; value: BusinessEmployeeRole }> = [
  { label: "Staff", value: "staff" },
  { label: "Manager", value: "manager" },
  { label: "Owner", value: "owner" },
];

const statusOptions: Array<{ label: string; value: BusinessEmployeeStatus }> = [
  { label: "Active", value: "active" },
  { label: "Off duty", value: "off_duty" },
  { label: "Inactive", value: "inactive" },
];

const createDefaultAvailability = () =>
  defaultAvailability.map((item) => ({ ...item }));

const mergeAvailability = (items: ProviderAvailability[] = []) =>
  defaultAvailability.map((defaultItem) => {
    const existing = items.find((item) => item.day === defaultItem.day);

    return {
      ...defaultItem,
      ...existing,
    };
  });

export default function BusinessTeamScreen() {
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ action?: string; intent?: string }>();
  const action = Array.isArray(params.action) ? params.action[0] : params.action;
  const intent = Array.isArray(params.intent) ? params.intent[0] : params.intent;
  const [availability, setAvailability] = useState<ProviderAvailability[]>(
    createDefaultAvailability
  );
  const [bio, setBio] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(action === "add");
  const [isBookable, setIsBookable] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [role, setRole] = useState<BusinessEmployeeRole>("staff");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [status, setStatus] = useState<BusinessEmployeeStatus>("active");

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;
  const isBusinessProfile = profile?.accountType === "business";

  const servicesQuery = useQuery({
    queryKey: ["provider-services"],
    queryFn: listMyServices,
    enabled: Boolean(isBusinessProfile),
  });

  const employeesQuery = useQuery({
    queryKey: ["business-employees"],
    queryFn: listBusinessEmployees,
    enabled: Boolean(isBusinessProfile),
  });

  const resetForm = useCallback((options: { keepOpen?: boolean } = {}) => {
    setBio("");
    setAvailability(createDefaultAvailability());
    setEditingEmployeeId(null);
    setEmail("");
    setError("");
    setIsBookable(true);
    setJobTitle("");
    setMessage("");
    setName("");
    setPhone("");
    setProfileImage(null);
    setProfileImageUrl("");
    setRole("staff");
    setSelectedServices([]);
    setSelectedSpecializations([]);
    setStatus("active");
    setIsFormVisible(Boolean(options.keepOpen));
  }, []);

  useEffect(() => {
    if (action === "add") {
      resetForm({ keepOpen: true });
    }
  }, [action, intent, resetForm]);

  const openNewEmployeeForm = () => {
    resetForm({ keepOpen: true });
  };

  const refreshTeamWorkspace = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["business-employees"] }),
      queryClient.invalidateQueries({ queryKey: ["business-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] }),
    ]);
  };

  const toggleSpecialization = (specialization: string) => {
    setSelectedSpecializations((items) =>
      items.includes(specialization)
        ? items.filter((item) => item !== specialization)
        : [...items, specialization]
    );
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((items) =>
      items.includes(serviceId)
        ? items.filter((item) => item !== serviceId)
        : [...items, serviceId]
    );
  };

  const updateAvailability = (
    day: string | undefined,
    updates: Partial<ProviderAvailability>
  ) => {
    if (!day) {
      return;
    }

    setAvailability((items) =>
      items.map((item) => (item.day === day ? { ...item, ...updates } : item))
    );
  };

  const toggleAvailabilityDay = (item: ProviderAvailability) => {
    const isAvailable = item.isAvailable !== false;
    const defaults = defaultAvailability.find(
      (defaultItem) => defaultItem.day === item.day
    );

    updateAvailability(item.day, {
      closesAt: isAvailable ? "" : item.closesAt || defaults?.closesAt || "18:00",
      isAvailable: !isAvailable,
      opensAt: isAvailable ? "" : item.opensAt || defaults?.opensAt || "09:00",
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("Employee name is required.");
      }

      const payload = {
        availability,
        bio: bio.trim() || undefined,
        email: email.trim() || undefined,
        isBookable,
        jobTitle: jobTitle.trim() || undefined,
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        services: selectedServices,
        specializations: selectedSpecializations,
        status,
      };

      const employee = await (editingEmployeeId
        ? updateBusinessEmployee(editingEmployeeId, payload)
        : createBusinessEmployee(payload));

      if (profileImage) {
        return uploadBusinessEmployeeImage(employee._id, profileImage);
      }

      return employee;
    },
    onMutate: () => {
      setError("");
      setMessage("");
    },
    onSuccess: async () => {
      await refreshTeamWorkspace();
      resetForm();
      setMessage("Employee saved.");
    },
    onError: (saveError) => {
      setError(getApiErrorMessage(saveError));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateBusinessEmployee,
    onSuccess: async () => {
      await refreshTeamWorkspace();
      resetForm();
      setMessage("Employee deactivated.");
    },
    onError: (deactivateError) => {
      setError(getApiErrorMessage(deactivateError));
    },
  });

  const editEmployee = (employee: BusinessEmployee) => {
    setBio(employee.bio || "");
    setAvailability(
      employee.availability?.length
        ? mergeAvailability(employee.availability)
        : createDefaultAvailability()
    );
    setEditingEmployeeId(employee._id);
    setEmail(employee.email || "");
    setError("");
    setIsBookable(employee.isBookable !== false);
    setJobTitle(employee.jobTitle || "");
    setMessage("");
    setName(employee.name);
    setPhone(employee.phone || "");
    setProfileImage(null);
    setProfileImageUrl(employee.profileImage || "");
    setRole(employee.role || "staff");
    setSelectedServices((employee.services || []).map((service) => service._id));
    setSelectedSpecializations(employee.specializations || []);
    setStatus(employee.status || "active");
    setIsFormVisible(true);
  };

  const pickProfileImage = async () => {
    setError("");
    setMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Allow photo library access to add an employee photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.86,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setProfileImage(result.assets[0]);
    setProfileImageUrl(result.assets[0].uri);
  };

  const deactivateEmployee = (employee: BusinessEmployee) => {
    Alert.alert(
      "Deactivate employee",
      `Remove ${employee.name} from active booking?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => deactivateMutation.mutate(employee._id),
        },
      ]
    );
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading team workspace..." showBackButton size={82} />
    );
  }

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.title}>Team</Text>
        <DashboardCard title="Business setup required">
          <Text style={styles.body}>
            Complete your business profile before adding employees.
          </Text>
          <PrimaryButton
            label="Set up profile"
            onPress={() => router.push("/(provider)/profile")}
          />
        </DashboardCard>
      </Screen>
    );
  }

  if (!isBusinessProfile) {
    return (
      <Screen>
        <Text style={styles.title}>Team</Text>
        <DashboardCard title="Business feature">
          <Text style={styles.body}>
            Team management is available for beauty business accounts.
          </Text>
        </DashboardCard>
      </Screen>
    );
  }

  const employees = employeesQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const activeEmployees = employees.filter(
    (employee) => employee.status !== "inactive"
  );
  const bookableEmployees = activeEmployees.filter(
    (employee) => employee.isBookable !== false
  );
  const isCompactLayout = width < 380;
  const statCardWidth = getGridItemPercentWidth(2);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Team</Text>
          <Text style={styles.subtitle}>
            {bookableEmployees.length} bookable of {employees.length} total
          </Text>
        </View>
        {isFormVisible ? (
          <Pressable onPress={() => resetForm()} style={styles.clearButton}>
            <Text style={styles.clearText}>Cancel</Text>
          </Pressable>
        ) : (
          <Pressable onPress={openNewEmployeeForm} style={styles.addEmployeeButton}>
            <Ionicons color={colors.surface} name="person-add-outline" size={16} />
            <Text style={styles.addEmployeeText}>Add employee</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="people-outline"
          label="Active staff"
          value={String(activeEmployees.length)}
          width={statCardWidth}
        />
        <StatCard
          icon="calendar-outline"
          label="Bookable"
          value={String(bookableEmployees.length)}
          width={statCardWidth}
        />
      </View>

      {!isFormVisible && error ? <Text style={styles.error}>{error}</Text> : null}
      {!isFormVisible && message ? (
        <Text style={styles.success}>{message}</Text>
      ) : null}

      {isFormVisible ? (
        <DashboardCard title={editingEmployeeId ? "Edit employee" : "Add employee"}>
          <View style={styles.imagePickerRow}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImageFallback}>
                <Ionicons color={colors.primary} name="person-outline" size={24} />
              </View>
            )}
            <View style={styles.imagePickerCopy}>
              <Text style={styles.imagePickerTitle}>Employee photo</Text>
              <Text style={styles.imagePickerBody}>
                Helps clients and managers recognize each specialist.
              </Text>
            </View>
            <Pressable onPress={pickProfileImage} style={styles.imagePickerButton}>
              <Text style={styles.imagePickerButtonText}>
                {profileImageUrl ? "Change" : "Add"}
              </Text>
            </Pressable>
          </View>

          <TextField
            label="Full name"
            onChangeText={setName}
            placeholder="Tola Adebayo"
            value={name}
          />
          <TextField
            label="Job title"
            onChangeText={setJobTitle}
            placeholder="Senior hair stylist"
            value={jobTitle}
          />

          <View
            style={[
              styles.formGrid,
              isCompactLayout ? styles.formGridStack : null,
            ]}
          >
            <View
              style={[
                styles.formColumn,
                isCompactLayout ? styles.formColumnFull : null,
              ]}
            >
              <TextField
                keyboardType="phone-pad"
                label="Phone"
                onChangeText={setPhone}
                placeholder="+254 700 000000"
                value={phone}
              />
            </View>
            <View
              style={[
                styles.formColumn,
                isCompactLayout ? styles.formColumnFull : null,
              ]}
            >
              <TextField
                keyboardType="email-address"
                label="Email"
                onChangeText={setEmail}
                placeholder="tola@studio.com"
                value={email}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Role</Text>
          <View style={styles.chipGrid}>
            {roleOptions.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                onPress={() => setRole(item.value)}
                selected={role === item.value}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipGrid}>
            {statusOptions.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                onPress={() => setStatus(item.value)}
                selected={status === item.value}
              />
            ))}
          </View>

          <Pressable
            onPress={() => setIsBookable((value) => !value)}
            style={styles.toggleRow}
          >
            <View
              style={[
                styles.checkbox,
                isBookable ? styles.checkedCheckbox : null,
              ]}
            >
              {isBookable ? (
                <Ionicons color={colors.surface} name="checkmark" size={14} />
              ) : null}
            </View>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Can receive bookings</Text>
              <Text style={styles.toggleBody}>
                Turn this off for receptionists, owners, or temporary leave.
              </Text>
            </View>
          </Pressable>

          <View style={styles.scheduleHeader}>
            <Text style={styles.fieldLabel}>Working hours</Text>
            <Text style={styles.scheduleHint}>
              Used to hide unavailable specialists during booking.
            </Text>
          </View>
          <View style={styles.availabilityList}>
            {availability.map((item) => (
              <AvailabilityRow
                item={item}
                key={item.day}
                onChange={updateAvailability}
                onToggle={() => toggleAvailabilityDay(item)}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Specialization</Text>
          <View style={styles.chipGrid}>
            {businessSpecializationSuggestions.map((specialization) => (
              <Chip
                key={specialization}
                label={specialization}
                onPress={() => toggleSpecialization(specialization)}
                selected={selectedSpecializations.includes(specialization)}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Services they can perform</Text>
          {servicesQuery.isLoading ? (
            <LogoLoader label="Loading services..." size={30} />
          ) : services.length ? (
            <View style={styles.chipGrid}>
              {services.map((service) => (
                <Chip
                  key={service._id}
                  label={service.name}
                  onPress={() => toggleService(service._id)}
                  selected={selectedServices.includes(service._id)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.body}>
              Add services first, then assign them to employees.
            </Text>
          )}

          <TextField
            label="Bio"
            multiline
            onChangeText={setBio}
            placeholder="Short note clients and managers can understand."
            style={styles.bioInput}
            textAlignVertical="top"
            value={bio}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          <PrimaryButton
            label={editingEmployeeId ? "Save employee" : "Add employee"}
            loading={saveMutation.isPending}
            onPress={() => saveMutation.mutate()}
          />
        </DashboardCard>
      ) : null}

      <DashboardCard title="Employees">
        {employeesQuery.isLoading ? (
          <LogoLoader label="Loading employees..." size={32} />
        ) : employees.length ? (
          employees.map((employee) => (
            <EmployeeRow
              employee={employee}
              key={employee._id}
              onDeactivate={() => deactivateEmployee(employee)}
              onEdit={() => editEmployee(employee)}
            />
          ))
        ) : (
          <Text style={styles.body}>
            No employees yet. Tap Add employee to create your first team member.
          </Text>
        )}
      </DashboardCard>
    </Screen>
  );
}

type AvailabilityRowProps = {
  item: ProviderAvailability;
  onChange: (
    day: string | undefined,
    updates: Partial<ProviderAvailability>
  ) => void;
  onToggle: () => void;
};

function AvailabilityRow({ item, onChange, onToggle }: AvailabilityRowProps) {
  const isAvailable = item.isAvailable !== false;

  return (
    <View style={styles.availabilityRow}>
      <Pressable onPress={onToggle} style={styles.dayToggle}>
        <View
          style={[
            styles.smallCheckbox,
            isAvailable ? styles.checkedCheckbox : null,
          ]}
        >
          {isAvailable ? (
            <Ionicons color={colors.surface} name="checkmark" size={12} />
          ) : null}
        </View>
        <Text style={styles.dayText}>{item.day?.slice(0, 3)}</Text>
      </Pressable>
      <View style={styles.timeFields}>
        <TextInput
          editable={isAvailable}
          onChangeText={(value) => onChange(item.day, { opensAt: value })}
          placeholder="09:00"
          placeholderTextColor={colors.muted}
          style={[
            styles.timeInput,
            !isAvailable ? styles.disabledTimeInput : null,
          ]}
          value={item.opensAt || ""}
        />
        <Text style={styles.timeDivider}>to</Text>
        <TextInput
          editable={isAvailable}
          onChangeText={(value) => onChange(item.day, { closesAt: value })}
          placeholder="18:00"
          placeholderTextColor={colors.muted}
          style={[
            styles.timeInput,
            !isAvailable ? styles.disabledTimeInput : null,
          ]}
          value={item.closesAt || ""}
        />
      </View>
    </View>
  );
}

type ChipProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

function Chip({ label, onPress, selected }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.selectedChip : null]}
    >
      <Text style={[styles.chipText, selected ? styles.selectedChipText : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  width: ViewStyle["width"];
};

function StatCard({ icon, label, value, width }: StatCardProps) {
  return (
    <View style={[styles.statCard, { width }]}>
      <Ionicons color={colors.primary} name={icon} size={18} />
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

type EmployeeRowProps = {
  employee: BusinessEmployee;
  onDeactivate: () => void;
  onEdit: () => void;
};

function EmployeeRow({ employee, onDeactivate, onEdit }: EmployeeRowProps) {
  const isInactive = employee.status === "inactive";
  const initials =
    employee.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "V";

  return (
    <View style={[styles.employeeRow, isInactive ? styles.inactiveRow : null]}>
      {employee.profileImage ? (
        <Image source={{ uri: employee.profileImage }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )}
      <View style={styles.employeeCopy}>
        <View style={styles.employeeTitleRow}>
          <Text numberOfLines={1} style={styles.employeeName}>
            {employee.name}
          </Text>
          <View
            style={[
              styles.statusPill,
              isInactive ? styles.inactivePill : null,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isInactive ? styles.inactiveText : null,
              ]}
            >
              {(employee.status || "active").replace("_", " ")}
            </Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.employeeMeta}>
          {employee.jobTitle || employee.role || "Team member"}
        </Text>
        <Text numberOfLines={1} style={styles.employeeMeta}>
          {(employee.specializations || []).join(", ") || "No specialization"}
        </Text>
        <Text numberOfLines={1} style={styles.employeeServices}>
          {(employee.services || []).map((service) => service.name).join(", ") ||
            "No services assigned"}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <Pressable onPress={onEdit} style={styles.iconButton}>
          <Ionicons color={colors.primary} name="create-outline" size={18} />
        </Pressable>
        {!isInactive ? (
          <Pressable onPress={onDeactivate} style={styles.iconButton}>
            <Ionicons color={colors.danger} name="person-remove-outline" size={18} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  clearButton: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  addEmployeeButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addEmployeeText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  statCard: {
    gap: 4,
    minHeight: 72,
    paddingVertical: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  imagePickerRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  profileImage: {
    backgroundColor: colors.surface,
    borderRadius: 31,
    height: 62,
    width: 62,
  },
  profileImageFallback: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 31,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  imagePickerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  imagePickerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  imagePickerBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  imagePickerButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  imagePickerButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  formGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formGridStack: {
    flexDirection: "column",
  },
  formColumn: {
    flex: 1,
  },
  formColumnFull: {
    width: "100%",
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedChipText: {
    color: colors.surface,
  },
  toggleRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  checkbox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  checkedCheckbox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  toggleBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  scheduleHeader: {
    gap: 2,
  },
  scheduleHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  availabilityList: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  availabilityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dayToggle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    width: 70,
  },
  smallCheckbox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 5,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  dayText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  timeFields: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  timeInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 13,
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  disabledTimeInput: {
    backgroundColor: colors.background,
    color: colors.muted,
  },
  timeDivider: {
    color: colors.muted,
    fontSize: 12,
  },
  bioInput: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  success: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
  },
  employeeRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  inactiveRow: {
    opacity: 0.65,
  },
  avatar: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  employeeCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  employeeTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minWidth: 0,
  },
  employeeName: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  statusPill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  inactivePill: {
    backgroundColor: colors.border,
  },
  inactiveText: {
    color: colors.muted,
  },
  employeeMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  employeeServices: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  rowActions: {
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
});
