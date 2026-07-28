import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { BusinessEmployee } from "../../types/provider";

type BusinessTeamRailProps = {
  employees: BusinessEmployee[];
  onEmployeePress?: (employeeId: string) => void;
  selectedEmployeeId?: string;
};

export function BusinessTeamRail({
  employees,
  onEmployeePress,
  selectedEmployeeId,
}: BusinessTeamRailProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.rail}>
        {employees.map((employee) => {
          const selected = selectedEmployeeId === employee._id;

          return (
            <TeamMemberCard
              employee={employee}
              key={employee._id}
              onPress={
                onEmployeePress ? () => onEmployeePress(employee._id) : undefined
              }
              selected={selected}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

type TeamMemberCardProps = {
  employee: BusinessEmployee;
  onPress?: () => void;
  selected: boolean;
};

function TeamMemberCard({ employee, onPress, selected }: TeamMemberCardProps) {
  const initials =
    employee.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "V";
  const specialty =
    employee.jobTitle || employee.specializations?.[0] || "Specialist";

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.selectedCard : null,
        pressed && onPress ? styles.pressedCard : null,
      ]}
    >
      {employee.profileImage ? (
        <Image source={{ uri: employee.profileImage }} style={styles.image} />
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.initials, selected ? styles.selectedText : null]}>
            {initials}
          </Text>
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[styles.name, selected ? styles.selectedText : null]}
      >
        {employee.name}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.meta, selected ? styles.selectedMeta : null]}
      >
        {specialty}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
    minHeight: 128,
    padding: spacing.sm,
    width: 116,
  },
  selectedCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressedCard: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  image: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  fallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  initials: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  name: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
  },
  selectedText: {
    color: colors.surface,
  },
  selectedMeta: {
    color: colors.surfaceMuted,
  },
});
