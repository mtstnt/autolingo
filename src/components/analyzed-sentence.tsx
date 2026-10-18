import Furi from "@/components/furigana";
import type { Analysis, Chunk, Role } from "@/lib/llm";
import { Pressable, View } from "react-native";

// 8 fixed colors; chunk i uses colors[i % 8] so neighbors always differ.
const COLORS = ["#60a5fa", "#f87171", "#4ade80", "#facc15", "#c084fc", "#fb923c", "#22d3ee", "#f472b6"];
const UNDERLINED: Role[] = ["particle", "conjunction", "grammar_phrase"];

type Props = {
  result: Analysis;
  /** Called with the pressed chunk and the color it is rendered in. */
  onChunkPress?: (chunk: Chunk, color: string) => void;
  size?: number;
  colors?: string[];
  /** Roles drawn with an underline. */
  underlined?: Role[];
};

export default function AnalyzedSentence({
  result,
  onChunkPress,
  size = 28,
  colors = COLORS,
  underlined = UNDERLINED,
}: Props) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" }}>
      {result.chunks.map((chunk, i) => {
        if (chunk.text === "\n") return <View key={i} style={{ width: "100%", height: 10 }} />;
        const color = colors[i % colors.length];
        const textStyle = {
          color,
          textDecorationLine: underlined.includes(chunk.role) ? ("underline" as const) : ("none" as const),
        };
        return (
          <Pressable key={i} onPress={() => onChunkPress?.(chunk, color)}>
            <Furi segments={chunk.reading} size={size} textStyle={textStyle} furiStyle={{ color }} />
          </Pressable>
        );
      })}
    </View>
  );
}
