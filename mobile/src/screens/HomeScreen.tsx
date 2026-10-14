import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";
import { useAuth } from "../store/authStore";

const recent = [
  { id: "1", name: "Salary", category: "Income", amount: 2400 },
  { id: "2", name: "Tesco", category: "Groceries", amount: -54.2 },
  { id: "3", name: "Netflix", category: "Subscriptions", amount: -10.99 },
  { id: "4", name: "Uber", category: "Transport", amount: -18.5 },
];

const money = (n: number) =>
  `${n < 0 ? "-" : ""}£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

export default function HomeScreen() {
  const user = useAuth((s) => s.currentUser);
  const logout = useAuth((s) => s.logout);

  const income = recent.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const spent = recent.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);
  const balance = income + spent;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.header}>
          <View>
            <Text style={s.muted}>Welcome back</Text>
            <Text style={s.title}>{user?.name ?? "there"}</Text>
          </View>
          <Pressable onPress={logout}><Text style={s.link}>Log out</Text></Pressable>
        </View>

        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Total balance</Text>
          <Text style={s.balance}>{money(balance)}</Text>
        </View>

        <View style={s.row}>
          <View style={[s.card, s.half]}>
            <Text style={s.muted}>Income</Text>
            <Text style={[s.stat, { color: colors.green }]}>{money(income)}</Text>
          </View>
          <View style={[s.card, s.half]}>
            <Text style={s.muted}>Spent</Text>
            <Text style={[s.stat, { color: colors.spend }]}>{money(spent)}</Text>
          </View>
        </View>

        <Text style={s.section}>Recent transactions</Text>
        <View style={s.card}>
          {recent.map((t, i) => (
            <View key={t.id} style={[s.tx, i < recent.length - 1 && s.txLine]}>
              <View>
                <Text style={s.txName}>{t.name}</Text>
                <Text style={s.muted}>{t.category}</Text>
              </View>
              <Text style={[s.txAmount, { color: t.amount > 0 ? colors.green : colors.ink }]}>
                {money(t.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.ink, fontSize: 24, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.green, fontWeight: "600" },
  balanceCard: { backgroundColor: colors.green, borderRadius: 20, padding: 22 },
  balanceLabel: { color: colors.greenDark, fontSize: 14, fontWeight: "600" },
  balance: { color: colors.greenDark, fontSize: 34, fontWeight: "800", marginTop: 6 },
  row: { flexDirection: "row", gap: 12 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.line },
  half: { flex: 1 },
  stat: { fontSize: 20, fontWeight: "700", marginTop: 4 },
  section: { color: colors.ink, fontSize: 17, fontWeight: "700", marginTop: 4 },
  tx: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  txLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  txName: { color: colors.ink, fontSize: 15, fontWeight: "600" },
  txAmount: { fontSize: 15, fontWeight: "700" },
});
