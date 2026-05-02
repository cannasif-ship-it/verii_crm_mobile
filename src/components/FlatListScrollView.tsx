import React from "react";
import { Platform, ScrollView, type ScrollViewProps } from "react-native";

export type FlatListScrollViewProps = ScrollViewProps & {
  children?: React.ReactNode;
};

const ANDROID = Platform.OS === "android";

export function FlatListScrollView({
  children,
  keyboardShouldPersistTaps = "handled",
  removeClippedSubviews,
  scrollEventThrottle,
  overScrollMode,
  ...rest
}: FlatListScrollViewProps): React.ReactElement {
  return (
    <ScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      removeClippedSubviews={removeClippedSubviews ?? ANDROID}
      scrollEventThrottle={scrollEventThrottle ?? 16}
      overScrollMode={overScrollMode ?? "never"}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
