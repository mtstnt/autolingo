import Furi from "@/components/furigana";
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ToolLoopAgent } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  fetch: expoFetch as unknown as typeof globalThis.fetch,
  headers: {
    'X-OpenRouter-Title': 'rn-app',
  },
});

const agent = new ToolLoopAgent({
  model: openrouter('nvidia/nemotron-3.5-lightning:free'),
  instructions: 'You are a helpful assistant.',
});

export default function Index() {
  // const [input, setInput] = useState('');
  // const { messages, error, sendMessage } = useChat({
  //   transport: new DirectChatTransport({ agent }),
  //   onError: error => console.error(error, 'ERROR'),
  // });

  // if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ height: '100%' }}>
      <View className="flex items-center justify-center h-full">
        <View className="p-8">
          <Furi
            segments={[
              { text: '私', furi: 'わたし' },
              { text: 'は' },
              { text: '日本語', furi: 'にほんご' },
              { text: 'を' },
              { text: '勉強', furi: 'べんきょう' },
              { text: 'しています。' },
              { text: '\n' },
              { text: '今日', furi: 'きょう' },
              { text: 'は' },
              { text: '天気', furi: 'てんき' },
              { text: 'がいいですね。' },
            ]}
            style={{  }}
            textStyle={{ color: 'white' }}
            furiStyle={{
              // fontFamily: '',
              color: 'white',
              borderColor: 'red',
              borderWidth: 0,
            }}
            showFuri={true}
            size={24}
          />
        </View>
      </View>
      {/* <View
        style={{
          height: "90%",
          display: 'flex',
          flexDirection: 'column',
          paddingHorizontal: 8,
        }}
      >
        <ScrollView style={{ flex: 1 }}>
          {messages.map(m => (
            <View key={m.id} style={{ marginVertical: 8 }}>
              <View>
                <Text className="dark:text-white">{m.role}</Text>
                {m.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <Text className="dark:text-white" key={`${m.id}-${i}`}>{part.text}</Text>;
                  }
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={{ marginTop: 8 }}>
          <TextInput
            style={{ backgroundColor: 'white', padding: 8 }}
            placeholder="Say something..."
            value={input}
            onChange={e => setInput(e.nativeEvent.text)}
            onSubmitEditing={e => {
              e.preventDefault();
              sendMessage({ text: input });
              setInput('');
            }}
            autoFocus={true}
          />
        </View>
      </View> */}
    </SafeAreaView>
  );
}
