import { Platform, StyleSheet } from 'react-native';

import { Text, TextProps } from './Themed';

const styles = StyleSheet.create({
  mono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, styles.mono]} />;
}
