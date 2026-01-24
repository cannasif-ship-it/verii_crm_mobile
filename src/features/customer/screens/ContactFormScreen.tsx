import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useContact, useCreateContact, useUpdateContact, useTitles } from "../hooks";
import { FormField, CustomerPicker } from "../components";
import { createContactSchema, type ContactFormData } from "../schemas";
import type { CustomerDto, TitleDto } from "../types";

export function ContactFormScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const isEditMode = !!id;
  const contactId = id ? Number(id) : undefined;

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | undefined>();

  const { data: existingContact, isLoading: contactLoading } = useContact(contactId);
  const { data: titles } = useTitles();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const schema = useMemo(() => createContactSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      mobile: "",
      notes: "",
      customerId: 0,
      titleId: 0,
    },
  });

  const watchTitleId = watch("titleId");
  const watchCustomerId = watch("customerId");

  const selectedTitle = titles?.find((t) => t.id === watchTitleId);

  useEffect(() => {
    if (existingContact) {
      reset({
        fullName: existingContact.fullName,
        email: existingContact.email || "",
        phone: existingContact.phone || "",
        mobile: existingContact.mobile || "",
        notes: existingContact.notes || "",
        customerId: existingContact.customerId,
        titleId: existingContact.titleId,
      });
      setSelectedCustomerName(existingContact.customerName);
    }
  }, [existingContact, reset]);

  const handleCustomerChange = useCallback(
    (customer: CustomerDto | undefined) => {
      setValue("customerId", customer?.id || 0);
      setSelectedCustomerName(customer?.name);
    },
    [setValue]
  );

  const handleTitleSelect = useCallback(
    (title: TitleDto) => {
      setValue("titleId", title.id);
      setTitleModalOpen(false);
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      try {
        const payload = {
          ...data,
          email: data.email || undefined,
        };

        if (isEditMode && contactId) {
          await updateContact.mutateAsync({ id: contactId, data: payload });
          Alert.alert("", t("contact.updateSuccess"));
        } else {
          await createContact.mutateAsync(payload);
          Alert.alert("", t("contact.createSuccess"));
        }
        router.back();
      } catch {
        Alert.alert(t("common.error"), t("common.error"));
      }
    },
    [isEditMode, contactId, createContact, updateContact, router, t]
  );

  const renderTitleItem = useCallback(
    ({ item }: { item: TitleDto }) => {
      const isSelected = watchTitleId === item.id;
      return (
        <TouchableOpacity
          style={[
            styles.pickerItem,
            { borderBottomColor: colors.border },
            isSelected && { backgroundColor: colors.activeBackground },
          ]}
          onPress={() => handleTitleSelect(item)}
        >
          <Text style={[styles.pickerItemText, { color: colors.text }]}>{item.titleName}</Text>
          {isSelected && <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [watchTitleId, colors, handleTitleSelect]
  );

  if (isEditMode && contactLoading) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("contact.edit")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={isEditMode ? t("contact.edit") : t("contact.create")}
          showBackButton
        />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("contact.fullName")}
                value={value}
                onChangeText={onChange}
                error={errors.fullName?.message}
                required
                maxLength={100}
              />
            )}
          />

          <View style={styles.fieldContainer}>
            <CustomerPicker
              value={watchCustomerId || undefined}
              customerName={selectedCustomerName}
              onChange={handleCustomerChange}
              label={t("contact.customer")}
            />
            {errors.customerId && (
              <Text style={[styles.error, { color: colors.error }]}>
                {errors.customerId.message}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("contact.titleField")} <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerField,
                { backgroundColor: colors.backgroundSecondary, borderColor: errors.titleId ? colors.error : colors.border },
              ]}
              onPress={() => setTitleModalOpen(true)}
            >
              <Text
                style={[
                  styles.pickerFieldText,
                  { color: selectedTitle ? colors.text : colors.textMuted },
                ]}
              >
                {selectedTitle?.titleName || t("lookup.selectTitle")}
              </Text>
              <Text style={[styles.arrow, { color: colors.textMuted }]}>▼</Text>
            </TouchableOpacity>
            {errors.titleId && (
              <Text style={[styles.error, { color: colors.error }]}>{errors.titleId.message}</Text>
            )}
          </View>

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("contact.phone")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="phone-pad"
                maxLength={20}
              />
            )}
          />

          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("contact.mobile")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="phone-pad"
                maxLength={20}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("contact.email")}
                value={value || ""}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("contact.notes")}
                value={value || ""}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                maxLength={250}
              />
            )}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.accent }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? t("common.update") : t("common.save")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal
        visible={titleModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTitleModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setTitleModalOpen(false)} />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("lookup.selectTitle")}
              </Text>
            </View>
            <FlatList
              data={titles}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderTitleItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  pickerField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  pickerFieldText: {
    fontSize: 15,
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  list: {
    flexGrow: 0,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "600",
  },
});
