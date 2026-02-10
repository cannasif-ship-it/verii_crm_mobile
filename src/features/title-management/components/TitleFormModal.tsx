import React, { useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useCreateTitle, useUpdateTitle } from "../hooks";
import { createTitleSchema, type TitleFormData } from "../schemas";
import type { TitleDto } from "../types";

interface TitleFormModalProps {
  visible: boolean;
  onClose: () => void;
  title?: TitleDto | null;
}

export function TitleFormModal({
  visible,
  onClose,
  title,
}: TitleFormModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();
  const createTitle = useCreateTitle();
  const updateTitle = useUpdateTitle();

  const isEditMode = !!title;

  const schema = useMemo(() => createTitleSchema(), []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TitleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleName: "",
      code: "",
    },
  });

  useEffect(() => {
    if (title) {
      reset({
        titleName: title.titleName,
        code: title.code || "",
      });
    } else {
      reset({
        titleName: "",
        code: "",
      });
    }
  }, [title, reset, visible]);

  const onSubmit = useCallback(
    async (data: TitleFormData) => {
      try {
        if (isEditMode && title) {
          await updateTitle.mutateAsync({
            id: title.id,
            data: {
              titleName: data.titleName,
              code: data.code || undefined,
            },
          });
        } else {
          await createTitle.mutateAsync({
            titleName: data.titleName,
            code: data.code || undefined,
          });
        }
        onClose();
      } catch (error) {
      }
    },
    [isEditMode, title, createTitle, updateTitle, onClose]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  }, [isSubmitting, reset, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={handleClose} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isEditMode ? t("titleManagement.edit") : t("titleManagement.create")}
            </Text>
          </View>

          <FlatListScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              <Controller
                control={control}
                name="titleName"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.field}>
                    <View style={styles.labelContainer}>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>
                        {t("titleManagement.titleName")}
                      </Text>
                      <Text style={[styles.required, { color: colors.error }]}>*</Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: errors.titleName ? colors.error : colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          {
                            color: colors.text,
                          },
                        ]}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t("titleManagement.titleNamePlaceholder")}
                        placeholderTextColor={colors.textMuted}
                        maxLength={100}
                        autoFocus={!isEditMode}
                      />
                    </View>
                    {errors.titleName && (
                      <Text style={[styles.errorText, { color: colors.error }]}>
                        {errors.titleName.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.field}>
                    <View style={styles.labelContainer}>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>
                        {t("titleManagement.code")}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: errors.code ? colors.error : colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          {
                            color: colors.text,
                          },
                        ]}
                        value={value}
                        onChangeText={onChange}
                        placeholder={t("titleManagement.codePlaceholder")}
                        placeholderTextColor={colors.textMuted}
                        maxLength={10}
                      />
                    </View>
                    {errors.code && (
                      <Text style={[styles.errorText, { color: colors.error }]}>
                        {errors.code.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
          </FlatListScrollView>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
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
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    width: "100%",
    minHeight: 300,
  },
  modalHeader: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  required: {
    fontSize: 14,
    marginLeft: 4,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 48,
    justifyContent: "center",
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
    width: "100%",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
