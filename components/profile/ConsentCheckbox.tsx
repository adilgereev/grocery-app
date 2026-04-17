import { Colors, Spacing } from "@/constants/theme";
import { SetupProfileFormData } from "@/lib/utils/schemas";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConsentCheckboxProps {
  control: Control<SetupProfileFormData>;
  error?: FieldError;
}

export default function ConsentCheckbox({
  control,
  error,
}: ConsentCheckboxProps) {
  const router = useRouter();

  return (
    <Controller
      control={control}
      name="terms_accepted"
      render={({ field: { value, onChange } }) => (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => onChange(!value)}
            activeOpacity={0.7}
            testID="setup-terms-checkbox"
          >
            <Ionicons
              name={value ? "checkbox" : "square-outline"}
              size={22}
              color={value ? Colors.light.primary : Colors.light.border}
              style={styles.icon}
            />
            <Text style={styles.label}>
              Я принимаю и даю согласие на обработку персональных данных согласно{" "}
              <Text
                style={styles.link}
                onPress={() => router.push("/privacy-policy" as any)}
                testID="setup-terms-policy-link"
              >
                Политике конфиденциальности
              </Text>
            </Text>
          </TouchableOpacity>
          {error && (
            <Text style={styles.errorText} testID="setup-terms-error">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s,
  },
  icon: {
    marginTop: 1,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: Colors.light.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 30,
    fontWeight: "500",
  },
});
