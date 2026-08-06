import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ServiceCategory } from "../../constants/marketplace";
import { colors, radii, spacing } from "../../constants/theme";

type CategoryScrollerProps = {
  categories: ServiceCategory[];
  onSelect: (category?: string) => void;
  selectedCategory?: string;
};

export function CategoryScroller({
  categories,
  onSelect,
  selectedCategory,
}: CategoryScrollerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
    >
      <View style={styles.content}>
        {categories.map((category) => {
          const selected = category.value === selectedCategory;

          return (
            <Pressable
              key={category.value}
              onPress={() => onSelect(selected ? undefined : category.value)}
              style={[styles.item, selected ? styles.selectedItem : null]}
            >
              <View style={[styles.bubble, selected ? styles.selectedBubble : null]}>
                <MaterialCommunityIcons
                  color={selected ? colors.surface : colors.primary}
                  name={
                    category.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={26}
                />
              </View>
              <Text style={[styles.label, selected ? styles.selectedLabel : null]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    marginHorizontal: -spacing.sm,
  },
  content: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  item: {
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 72,
  },
  bubble: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  selectedBubble: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  selectedItem: {},
  selectedLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
});
