import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../constants/theme";
import { UserRole } from "../types/auth";

export type SignupRole = Exclude<UserRole, "admin">;

type RoleOption = {
  label: string;
  role: SignupRole;
};

const options: RoleOption[] = [
  { label: "Client", role: "client" },
  { label: "Professional", role: "beauty_professional" },
  { label: "Business", role: "beauty_business" },
];

type RolePickerProps = {
  onChange: (role: SignupRole) => void;
  value: SignupRole;
};

export function RolePicker({ onChange, value }: RolePickerProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.role === value;

        return (
          <Pressable
            key={option.role}
            onPress={() => onChange(option.role)}
            style={[styles.option, selected ? styles.selected : null]}
          >
            <Text style={[styles.label, selected ? styles.selectedLabel : null]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs,
  },
  option: {
    alignItems: "center",
    borderRadius: radii.sm,
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
  },
  selected: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "400",
  },
  selectedLabel: {
    color: colors.surface,
  },
});
