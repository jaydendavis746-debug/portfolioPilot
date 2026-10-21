import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { colors } from "../theme";
import { api } from "../api/client";
import { useAuth, User } from "../store/authStore";

interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuth((s) => s.setAuth);

  const handleSubmit = async () => {
    setError(null);


    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isLogin && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        
        const res = await api.post<AuthResponse>("/users/login", {
          email: email.trim().toLowerCase(),
          password,
        });
        await setAuth(res.user, res.token);
      } else {
   
        const res = await api.post<AuthResponse>("/users/register", {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        await setAuth(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.brandTitle}>PortfolioPilot</Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Welcome back. Sign in to your account." : "Create your account to get started."}
          </Text>
        </View>


        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => {
              setIsLogin(true);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => {
              setIsLogin(false);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

  
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

    
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jayden Davis"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.deep} />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? "Sign In" : "Create Account"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.line,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
  activeTabText: {
    color: colors.ink,
  },
  errorBox: {
    backgroundColor: "rgba(255, 122, 102, 0.15)",
    borderWidth: 1,
    borderColor: colors.spend,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.spend,
    fontSize: 13,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.ink,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.deep,
    fontWeight: "700",
    fontSize: 15,
  },
});
