import AnalyzedSentence from "@/components/analyzed-sentence";
import { analyzeSentence, MODELS, type Analysis, type Chunk, type ModelId } from "@/lib/llm";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Info({ chunk, color }: { chunk: Chunk; color: string }) {
  const { meaning, grammar } = chunk;
  const rows: [string, string | undefined][] = [
    ["Role", chunk.role],
    ["Meaning (context)", meaning?.in_context],
    ["Meaning (dictionary)", meaning?.dictionary],
    ["Dictionary form", grammar?.dictionary_form],
    ["Conjugation", grammar?.conjugation],
    ["Grammar", grammar?.explanation],
    ["In this sentence", grammar?.implication],
  ];
  return (
    <View className="gap-2">
      <Text style={{ color, fontSize: 22 }}>{chunk.text}</Text>
      {rows.map(([label, value]) =>
        value ? (
          <Text key={label} className="text-zinc-300">
            <Text className="font-bold text-white">{label}: </Text>
            {value}
          </Text>
        ) : null,
      )}
    </View>
  );
}

export default function Index() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Analysis>();
  const [selected, setSelected] = useState<{ chunk: Chunk; color: string }>();
  const [elapsed, setElapsed] = useState<number>();
  const [stats, setStats] = useState<string>();
  const [model, setModel] = useState<ModelId>(MODELS[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function submit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(undefined);
    setSelected(undefined);
    setElapsed(undefined);
    setStats(undefined);
    console.log("[llm] request started:", input.trim());
    const t0 = Date.now();
    try {
      const { analysis, stats } = await analyzeSentence(input.trim(), model);
      setResult(analysis);
      setStats(stats);
      const sec = (Date.now() - t0) / 1000;
      console.log(`[llm] response received in ${sec.toFixed(2)}s`);
      setElapsed(sec);
    } catch (e) {
      console.log(`[llm] failed after ${((Date.now() - t0) / 1000).toFixed(2)}s`);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1" contentContainerClassName="p-6 gap-6">
        {loading && <ActivityIndicator />}
        {error && <Text className="text-red-400">{error}</Text>}
        {result && <AnalyzedSentence result={result} onChunkPress={(chunk, color) => setSelected({ chunk, color })} />}
        {result && <Text className="text-lg text-zinc-200">{result.translation}</Text>}
        {elapsed !== undefined && <Text className="text-zinc-400">({elapsed.toFixed(2)} s){stats && `\n${stats}`}</Text>}
      </ScrollView>
      <View className="px-4">
        <Pressable className="p-3 rounded-lg bg-zinc-800" onPress={() => setMenuOpen((o) => !o)}>
          <Text className="text-zinc-200">Model: {model} ▾</Text>
        </Pressable>
        {menuOpen &&
          MODELS.map((m) => (
            <Pressable
              key={m}
              className="p-3 border-t border-zinc-700 bg-zinc-800"
              onPress={() => {
                setModel(m);
                setMenuOpen(false);
              }}>
              <Text className={m === model ? "font-bold text-blue-400" : "text-zinc-200"}>{m}</Text>
            </Pressable>
          ))}
      </View>
      <View className="flex-row gap-2 p-4">
        <TextInput
          className="flex-1 p-3 bg-white rounded-lg max-h-40"
          multiline
          placeholder="日本語の文を入力…"
          value={input}
          onChangeText={setInput}
        />
        <Pressable className="justify-center px-4 bg-blue-500 rounded-lg" onPress={submit}>
          <Text className="font-bold text-white">Go</Text>
        </Pressable>
      </View>
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(undefined)}>
        <Pressable className="justify-center flex-1 px-4 bg-black/60" onPress={() => setSelected(undefined)}>
          <Pressable className="max-h-[70%]">
            <ScrollView className="rounded-2xl bg-zinc-800" contentContainerClassName="p-4">
              {selected && <Info {...selected} />}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
