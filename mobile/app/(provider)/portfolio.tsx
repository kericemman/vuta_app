import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { DashboardCard } from "../../src/components/DashboardCard";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { colors, radii, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import {
  deletePortfolioImage,
  getMyProviderProfileStatus,
  uploadPortfolioImage,
} from "../../src/services/provider.service";
import { PortfolioImage } from "../../src/types/marketplace";
import { getGridItemWidth } from "../../src/utils/responsiveGrid";

export default function ProviderPortfolioScreen() {
  const queryClient = useQueryClient();
  const { width: screenWidth } = useWindowDimensions();
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const galleryImageSize = getGridItemWidth(screenWidth, 2);

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;
  const portfolio = profile?.portfolio ?? [];

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        throw new Error("Allow photo library access to upload portfolio images.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.86,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      return uploadPortfolioImage(result.assets[0], caption);
    },
    onMutate: () => {
      setError("");
      setMessage("");
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      setCaption("");
      setMessage("Portfolio image uploaded.");
    },
    onError: (uploadError) => {
      setError(getApiErrorMessage(uploadError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortfolioImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      setMessage("Portfolio image removed.");
    },
    onError: (deleteError) => {
      setError(getApiErrorMessage(deleteError));
    },
  });

  const confirmDelete = (image: PortfolioImage) => {
    if (!image.publicId) {
      return;
    }

    Alert.alert("Remove image", "Remove this image from your portfolio?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteMutation.mutate(image.publicId || ""),
      },
    ]);
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading portfolio..." showBackButton size={82} />
    );
  }

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.title}>Portfolio</Text>
        <DashboardCard title="Profile setup required">
          <Text style={styles.body}>
            Complete your professional profile before uploading portfolio work.
          </Text>
          <PrimaryButton
            label="Set up profile"
            onPress={() => router.push("/(provider)/profile")}
          />
        </DashboardCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>{portfolio.length}/8 images</Text>
        </View>
      </View>

      <View style={styles.gallerySection}>
        <View style={styles.galleryHeader}>
          <Text style={styles.sectionTitle}>Uploaded work</Text>
          <Text style={styles.subtitle}>{portfolio.length}/8</Text>
        </View>
        {portfolio.length ? (
          <View style={styles.gallery}>
            {portfolio.map((image) => (
              <View
                key={image.publicId || image.url}
                style={[
                  styles.imageCard,
                  { height: galleryImageSize, width: galleryImageSize },
                ]}
              >
                <Image
                  resizeMode="cover"
                  source={{ uri: image.url }}
                  style={styles.image}
                />
                {image.caption ? (
                  <View style={styles.captionOverlay}>
                    <Text numberOfLines={1} style={styles.caption}>
                      {image.caption}
                    </Text>
                  </View>
                ) : null}
                {image.publicId ? (
                  <Pressable
                    disabled={deleteMutation.isPending}
                    onPress={() => confirmDelete(image)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && !deleteMutation.isPending
                        ? styles.pressedDelete
                        : null,
                    ]}
                  >
                    <Ionicons
                      color={colors.surface}
                      name="trash-outline"
                      size={15}
                    />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <DashboardCard title="Gallery">
            <Text style={styles.body}>No portfolio images uploaded yet.</Text>
          </DashboardCard>
        )}
      </View>

      <DashboardCard title="Upload work">
        <TextField
          label="Caption"
          onChangeText={setCaption}
          placeholder="Silk press finish"
          value={caption}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <PrimaryButton
          label={portfolio.length >= 8 ? "Portfolio full" : "Upload image"}
          loading={uploadMutation.isPending}
          onPress={() => {
            if (portfolio.length >= 8) {
              setError("Portfolio can contain a maximum of 8 images.");
              return;
            }

            uploadMutation.mutate();
          }}
        />
      </DashboardCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
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
  gallerySection: {
    gap: spacing.sm,
  },
  galleryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  imageCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  captionOverlay: {
    backgroundColor: "rgba(33, 26, 32, 0.62)",
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: "absolute",
    right: 0,
  },
  caption: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "rgba(33, 26, 32, 0.68)",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: spacing.xs,
    top: spacing.xs,
    width: 34,
  },
  pressedDelete: {
    opacity: 0.76,
  },
});
