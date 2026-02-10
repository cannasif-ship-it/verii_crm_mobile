import React from "react";
import { FlatList, View, type FlatListProps, type StyleProp, type ViewStyle } from "react-native";

interface FlatListScrollViewProps
  extends Omit<FlatListProps<number>, "data" | "renderItem" | "keyExtractor"> {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function FlatListScrollView({
  children,
  contentContainerStyle,
  ...rest
}: FlatListScrollViewProps): React.ReactElement {
  return (
    <FlatList
      data={[0]}
      extraData={children}
      keyExtractor={(item) => String(item)}
      renderItem={() => <View style={{ width: "100%" }}>{children}</View>}
      removeClippedSubviews={false}
      contentContainerStyle={contentContainerStyle}
      {...rest}
    />
  );
}
