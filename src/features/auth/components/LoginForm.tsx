import React, { useState, useMemo } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  ToastAndroid,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { VStack } from "../../../components/ui/vstack";
import { Text } from "../../../components/ui/text";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../../../components/ui/form-control";
import {
  Location01Icon,
  Mail02Icon,
  LockKeyIcon,
  ViewIcon,
  ViewOffIcon,
  Tick02Icon,
  ArrowDown01Icon,
  Alert02Icon,
} from "hugeicons-react-native";

import { useLogin } from "../hooks/useLogin";
import { useBranches } from "../hooks/useBranches";
import { createLoginSchema, type LoginFormData } from "../schemas";
import type { Branch } from "../types";

const COLORS = {
  inputBg: "#15111D",
  border: "rgba(255, 255, 255, 0.08)",
  placeholder: "#6b7280",
  pink: "#eb0064",
};

const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <Pressable 
    onPress={onChange}
    className={`w-5 h-5 rounded-[4px] items-center justify-center border ${
      checked ? "bg-[#eb0064] border-[#eb0064]" : "bg-transparent border-white/20"
    }`}
  >
    {checked && <Tick02Icon size={14} color="white" strokeWidth={4} />}
  </Pressable>
);

function BranchItem({ item, isSelected, onSelect }: { item: Branch; isSelected: boolean; onSelect: (b: Branch) => void }) {
  return (
    <Pressable
      onPress={() => onSelect(item)}
      className={`flex-row items-center justify-between py-4 px-5 rounded-xl mb-2 border ${
        isSelected ? "bg-white/10 border-[#eb0064]" : "bg-white/5 border-white/5"
      }`}
    >
      <Text className={`text-[15px] ${isSelected ? "text-[#eb0064] font-bold" : "text-white"}`}>
        {item.name}
      </Text>
      {isSelected && <Tick02Icon size={20} color="#eb0064" />}
    </Pressable>
  );
}

export function LoginForm(): React.ReactElement {
  const { t } = useTranslation();
  const { login, isLoading, error } = useLogin();
  const { branches, isLoading: isBranchesLoading } = useBranches();

  const [showPassword, setShowPassword] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const loginSchema = useMemo(() => createLoginSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormData>,
    mode: "onBlur",
    defaultValues: {
      branchId: "",
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const showToast = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show("Yakında...", ToastAndroid.SHORT);
    }
  };

  const onSubmit = (data: LoginFormData) => {
    if (!selectedBranch) return;
    login({ loginData: data, branch: selectedBranch }, { onSuccess: () => router.replace("/(tabs)") });
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setValue("branchId", branch.id, { shouldValidate: true });
    setShowBranchModal(false);
  };

  const getInputClasses = (hasError: boolean, isFocused: boolean) => {
    const base = "flex-row items-center bg-[#15111D] border rounded-2xl px-5 h-[60px]";
    if (hasError) return `${base} border-red-500/80`;
    if (isFocused) return `${base} border-[#eb0064]/50`;
    return `${base} border-white/10`;
  };

  return (
    <VStack space="xl" className="w-full px-1">
      <View className="items-center mb-4">
        <Text className="text-slate-300 text-[11px] font-bold tracking-[2px] uppercase opacity-70">
          SATIŞ & MÜŞTERİ YÖNETİMİ
        </Text>
      </View>

      <VStack space="md">
        <FormControl isInvalid={!!errors.branchId}>
          <Controller
            control={control}
            name="branchId"
            render={() => (
              <Pressable
                onPress={() => !isBranchesLoading && setShowBranchModal(true)}
                className={getInputClasses(!!errors.branchId, showBranchModal)}
              >
                <Location01Icon size={20} color="#9ca3af" /> 
                <View className="flex-1 ml-4 justify-center">
                  {isBranchesLoading ? (
                    <Text className="text-slate-500 text-sm">{t("common.loading")}</Text>
                  ) : (
                    <Text className={`text-[15px] ${selectedBranch ? "text-white" : "text-slate-400"}`}>
                      {selectedBranch ? selectedBranch.name : "Şube Seçiniz"}
                    </Text>
                  )}
                </View>
                <ArrowDown01Icon size={16} color="#6b7280" />
              </Pressable>
            )}
          />
          {errors.branchId && (
            <FormControlError>
               <FormControlErrorText className="text-red-400 text-xs ml-2 mt-1">
                 {errors.branchId.message}
               </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className={getInputClasses(!!errors.email, focusedInput === "email")}>
                <Mail02Icon size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-4 text-[15px] text-white h-full"
                  placeholder="Kurumsal E-posta"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => { setFocusedInput(null); onBlur(); }}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />
           {errors.email && (
            <FormControlError>
               <FormControlErrorText className="text-red-400 text-xs ml-2 mt-1">
                 {errors.email.message}
               </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className={getInputClasses(!!errors.password, focusedInput === "password")}>
                <LockKeyIcon size={20} color="#9ca3af" />
                <TextInput
                  className="flex-1 ml-4 text-[15px] text-white h-full"
                  placeholder="Şifre"
                  placeholderTextColor={COLORS.placeholder}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => { setFocusedInput(null); onBlur(); }}
                  onChangeText={onChange}
                  value={value}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                  {showPassword ? (
                    <ViewOffIcon size={20} color="#9ca3af" />
                  ) : (
                    <ViewIcon size={20} color="#9ca3af" />
                  )}
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <FormControlError>
               <FormControlErrorText className="text-red-400 text-xs ml-2 mt-1">
                 {errors.password.message}
               </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row justify-between items-center mt-2 px-1">
              <Pressable onPress={() => onChange(!value)} className="flex-row items-center gap-2.5">
                <CustomCheckbox checked={value} onChange={() => onChange(!value)} />
                <Text className="text-[13px] text-slate-300 font-medium">Beni Hatırla</Text>
              </Pressable>
              
              <Pressable onPress={showToast}>
                <Text className="text-[13px] text-slate-400 font-medium">Şifremi Unuttum?</Text>
              </Pressable>
            </View>
          )}
        />
      </VStack>

      {error && (
        <View className="flex-row items-center bg-red-500/10 rounded-lg p-3 mt-2 border border-red-500/20">
          <Alert02Icon size={18} color="#fca5a5" />
          <Text className="text-red-200 text-xs ml-2 flex-1">
            {error.message || t("auth.loginError")}
          </Text>
        </View>
      )}

    <TouchableOpacity
  onPress={handleSubmit(onSubmit)}
  disabled={isLoading || isBranchesLoading}
  activeOpacity={0.8}
  className="mt-6 rounded-3xl overflow-hidden shadow-lg shadow-pink-500/25" 
  style={{ elevation: 8 }}
>
  <LinearGradient
    colors={['#eb0064', '#ff5e3a', '#ffb700']} 
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}

    className="rounded-3xl h-[56px] items-center justify-center"
  >
    {isLoading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text className="text-white text-[15px] font-bold tracking-wider uppercase">
        GİRİŞ YAP
      </Text>
    )}
  </LinearGradient>
</TouchableOpacity>
      <Modal
        visible={showBranchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBranchModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setShowBranchModal(false)}
        >
          <Pressable 
            className="bg-[#1A1625] rounded-t-[30px] px-6 pb-10 pt-4 max-h-[70%] border-t border-white/10"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1 bg-white/20 rounded-full self-center mb-6" />
            <Text className="text-lg font-bold text-white text-center mb-5">Şube Seçiniz</Text>
            
            <FlatList
              data={branches}
              renderItem={({ item }) => (
                <BranchItem 
                  item={item} 
                  isSelected={selectedBranch?.id === item.id} 
                  onSelect={handleBranchSelect} 
                />
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </VStack>
  );
}