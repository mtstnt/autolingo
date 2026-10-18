import { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export type FuriganaSegment = {
  text: string;
  /** Reading shown above `text`. Omit for kana / punctuation. */
  furi?: string;
};

type FuriganaProps = {
  segments: FuriganaSegment[];
  size?: number;
  /** Furigana size as a fraction of `size`. */
  furiScale?: number;
  /** Hidden furigana still reserves its space, so toggling doesn't reflow. */
  showFuri?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  furiStyle?: StyleProp<TextStyle>;
};

/** Plain text is split per character so Japanese (no spaces) can wrap anywhere. */
function Furigana({
  segments,
  size = 16,
  furiScale = 0.5,
  showFuri = true,
  style,
  textStyle,
  furiStyle,
}: FuriganaProps) {
  return (
    <View style={[styles.row, style]}>
      {segments.flatMap((seg, i) => {
        if (seg.text === '\n') return [<View key={i} style={styles.newline} />];

        if (!seg.furi) {
          return [...seg.text].map((ch, j) => (
            <Text key={`${i}-${j}`} style={[{ fontSize: size }, textStyle]}>
              {ch}
            </Text>
          ));
        }

        const chars = [...seg.text];
        return [
          <View key={i} style={styles.ruby}>
            <Text
              style={[
                { fontSize: size * furiScale, textAlign: 'center' },
                furiStyle,
                !showFuri && styles.hidden,
              ]}>
              {seg.furi}
            </Text>
            <View style={[styles.row, { justifyContent: chars.length > 1 ? 'space-between' : 'center' }]}>
              {chars.map((ch, j) => (
                <Text key={j} style={[{ fontSize: size }, textStyle]}>
                  {ch}
                </Text>
              ))}
            </View>
          </View>,
        ];
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  ruby: { alignItems: 'stretch' },
  newline: { width: '100%', height: 10 },
  hidden: { opacity: 0 },
});

export default memo(Furigana);
