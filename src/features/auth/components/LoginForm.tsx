import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { VStack } from "../../../components/ui/vstack";
import { HStack } from "../../../components/ui/hstack";
import { Text } from "../../../components/ui/text";
import { Pressable } from "../../../components/ui/pressable";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../../../components/ui/form-control";
import { useLogin } from "../hooks/useLogin";
import { useBranches } from "../hooks/useBranches";
import { createLoginSchema, type LoginFormData } from "../schemas";
import type { Branch } from "../types";

interface BranchItemProps {
  item: Branch;
  isSelected: boolean;
  onSelect: (branch: Branch) => void;
}

function BranchItem({ item, isSelected, onSelect }: BranchItemProps): React.ReactElement {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={[styles.branchItem, isSelected && styles.branchItemSelected]}
    >
      <Text style={[styles.branchItemText, isSelected && styles.branchItemTextSelected]}>
        {item.name}
      </Text>
      {isSelected && <Text style={styles.branchCheckmark}>✓</Text>}
    </Pressable>
  );
}

export function LoginForm(): React.ReactElement {
  const { t } = useTranslation();
  const { login, isLoading, error } = useLogin();
  const { branches, isLoading: isBranchesLoading, isError: isBranchesError, refetch } = useBranches();
  const [showPassword, setShowPassword] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const loginSchema = useMemo(() => createLoginSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      branchId: "",
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormData): void => {
    if (!selectedBranch) return;

    login(
      {
        loginData: {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
        branch: selectedBranch,
      },
      {
        onSuccess: () => {
          router.replace("/(tabs)");
        },
      }
    );
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleBranchSelect = (branch: Branch): void => {
    setSelectedBranch(branch);
    setValue("branchId", branch.id, { shouldValidate: true });
    setShowBranchModal(false);
  };

  const renderBranchItem = ({ item }: { item: Branch }): React.ReactElement => (
    <BranchItem
      item={item}
      isSelected={selectedBranch?.id === item.id}
      onSelect={handleBranchSelect}
    />
  );

  const keyExtractor = (item: Branch): string => item.id;

  const isButtonDisabled = isLoading || isBranchesLoading;

  const errorMessage = error?.message || (error ? t("auth.loginError") : null);

  return (
    <VStack space="xl" className="w-full">
      <VStack space="lg">
        <FormControl isInvalid={!!errors.branchId}>
          <Text style={styles.label}>{t("auth.branch")}</Text>
          <Controller
            control={control}
            name="branchId"
            render={() => (
              <Pressable
                onPress={() => !isBranchesLoading && setShowBranchModal(true)}
                style={[styles.inputContainer, errors.branchId && styles.inputError]}
              >
                <Text style={styles.inputIcon}>🏢</Text>
                {isBranchesLoading ? (
                  <View style={styles.branchLoadingContainer}>
                    <ActivityIndicator size="small" color="#64748B" />
                    <Text style={styles.branchLoadingText}>{t("common.loading")}</Text>
                  </View>
                ) : isBranchesError ? (
                  <Pressable onPress={() => refetch()} style={styles.branchErrorContainer}>
                    <Text style={styles.branchErrorText}>{t("auth.branchLoadError")}</Text>
                    <Text style={styles.branchRetryText}>{t("common.retry")}</Text>
                  </Pressable>
                ) : (
                  <Text style={selectedBranch ? styles.textInput : styles.placeholderText}>
                    {selectedBranch ? selectedBranch.name : t("auth.branchPlaceholder")}
                  </Text>
                )}
                <Text style={styles.dropdownIcon}>▼</Text>
              </Pressable>
            )}
          />
          {errors.branchId && (
            <FormControlError>
              <FormControlErrorText style={styles.errorText}>
                {errors.branchId.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <Text style={styles.label}>{t("auth.email")}</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("auth.emailPlaceholder")}
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />
          {errors.email && (
            <FormControlError>
              <FormControlErrorText style={styles.errorText}>
                {errors.email.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <Text style={styles.label}>{t("auth.password")}</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("auth.passwordPlaceholder")}
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                <Pressable onPress={togglePasswordVisibility} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <FormControlError>
              <FormControlErrorText style={styles.errorText}>
                {errors.password.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { onChange, value } }) => (
            <HStack className="justify-between items-center">
              <Text style={styles.rememberMeText}>{t("auth.rememberMe")}</Text>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: "rgba(255, 255, 255, 0.1)", true: "#ec4899" }}
                thumbColor="#FFFFFF"
              />
            </HStack>
          )}
        />
      </VStack>

      <HStack className="justify-end">
        <Pressable>
          <Text style={styles.forgotPassword}>{t("auth.forgotPassword")}</Text>
        </Pressable>
      </HStack>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{errorMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isButtonDisabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            isButtonDisabled
              ? ["#9ca3af", "#6b7280", "#4b5563"]
              : ["#db2777", "#f97316", "#eab308"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButton}
        >
          {isLoading ? (
            <View style={styles.loginButtonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loginButtonText}>{t("auth.loggingIn")}</Text>
            </View>
          ) : (
            <View style={styles.loginButtonContent}>
              <Text style={styles.loginButtonText}>{t("auth.login")}</Text>
              <Text style={styles.loginButtonIcon}>→</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showBranchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBranchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t("auth.selectBranch")}</Text>
            <FlatList
              data={branches}
              renderItem={renderBranchItem}
              keyExtractor={keyExtractor}
              style={styles.branchList}
              showsVerticalScrollIndicator={false}
            />
            <Pressable
              onPress={() => setShowBranchModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>{t("common.cancel")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </VStack>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: "#ec4899",
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
    color: "#64748B",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#64748B",
  },
  branchLoadingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  branchLoadingText: {
    fontSize: 15,
    color: "#64748B",
  },
  branchErrorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  branchErrorText: {
    fontSize: 14,
    color: "#f472b6",
  },
  branchRetryText: {
    fontSize: 14,
    color: "#ec4899",
    fontWeight: "600",
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    color: "#f472b6",
    fontSize: 12,
    marginTop: 6,
  },
  rememberMeText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f472b6",
  },
  errorBox: {
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.3)",
    borderRadius: 12,
    padding: 12,
  },
  errorBoxText: {
    fontSize: 13,
    color: "#f472b6",
    textAlign: "center",
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loginButtonIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  branchList: {
    maxHeight: 300,
  },
  branchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  branchItemSelected: {
    backgroundColor: "rgba(236, 72, 153, 0.2)",
    borderWidth: 1,
    borderColor: "#ec4899",
  },
  branchItemText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  branchItemTextSelected: {
    fontWeight: "600",
    color: "#f472b6",
  },
  branchCheckmark: {
    fontSize: 18,
    color: "#ec4899",
    fontWeight: "700",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalCloseText: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "600",
  },
});
