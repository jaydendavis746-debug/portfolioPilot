import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../store/authStore";
import { colors } from "../theme";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, signUp } = useAuth();

  const submit = () =>
    setError(mode === "login" ? login(email, password) : signUp(name, email, password));

  return (
    <View style={s.wrap}>
      <Text style={s.title}>PortfolioPilot</Text>
      <View style={s.tabs}>
        {(["login", "signup"] as const).map(m => (
          <Pressable key={m} onPress={() => { setMode(m); setError(null); }}
            style={[s.tab, mode === m && s.tabOn]}>
            <Text style={[s.tabText, mode === m && { color: colors.greenDark }]}>
              {m === "login" ? "Log in" : "Sign up"}
            </Text>
          </Pressable>
        ))}
      </View>
      {mode === "signup" && (
        <TextInput style={s.input} placeholder="Name" placeholderTextColor={colors.muted}
          value={name} onChangeText={setName} />
      )}
      <TextInput style={s.input} placeholder="Email" placeholderTextColor={colors.muted}
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Password" placeholderTextColor={colors.muted}
        secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={s.error}>{error}</Text>}
      <Pressable style={s.btn} onPress={submit}>
        <Text style={s.btnText}>{mode === "login" ? "Log in" : "Create account"}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { color: colors.ink, fontSize: 28, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  tabs: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
  tabOn: { backgroundColor: colors.green },
  tabText: { color: colors.muted, fontWeight: "600" },
  input: { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, borderRadius: 12,
    color: colors.ink, padding: 14, marginBottom: 12 },
  error: { color: colors.spend, marginBottom: 12 },
  btn: { backgroundColor: colors.green, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
  btnText: { color: colors.greenDark, fontWeight: "700", fontSize: 16 },
});
