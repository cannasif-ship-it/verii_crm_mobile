import React from 'react';
import { Text as RNText } from 'react-native';
import { textStyle } from './styles';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

// Store ve Tema importları (Yolları kontrol et)
// components/ui/text klasöründen çıkıp src/store ve src/constants'a gidiyoruz
import { useUIStore } from '../../../store/ui';
import { COLORS } from '../../../constants/theme';

type ITextProps = React.ComponentProps<typeof RNText> &
  VariantProps<typeof textStyle>;

const Text = React.forwardRef<React.ComponentRef<typeof RNText>, ITextProps>(
  function Text(
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = 'md',
      sub,
      italic,
      highlight,
      style,
      ...props
    },
    ref
  ) {
    // Store'dan temayı çekiyoruz
    const { themeMode } = useUIStore();

    // Debug için: Konsolda tema değişimini görüyor musun?
    // console.log("TEXT COMPONENT RENDER - THEME:", themeMode);

    // Rengi belirliyoruz.
    // Eğer themeMode 'dark' ise #FFFFFF, değilse #111827
    const activeColor = themeMode === 'dark' ? '#FFFFFF' : '#111827';
    // Alternatif olarak COLORS dosyanı kullanmak istersen:
    // const activeColor = themeMode === 'dark' ? COLORS.dark.text : COLORS.light.text;

    return (
      <RNText
        className={textStyle({
          isTruncated: isTruncated as boolean,
          bold: bold as boolean,
          underline: underline as boolean,
          strikeThrough: strikeThrough as boolean,
          size,
          sub: sub as boolean,
          italic: italic as boolean,
          highlight: highlight as boolean,
          class: className,
        })}
        // activeColor'ı style dizisinin SONUNA ekliyoruz ki kesinlikle uygulansın
        style={[style, { color: activeColor }]} 
        {...props}
        ref={ref}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text };