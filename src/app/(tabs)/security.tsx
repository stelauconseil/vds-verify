import { View, ScrollView, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useScanStatus } from "../../contexts/ScanStatusContext";
import { useEffect, useState } from "react";
import { getLang } from "../../components/Label";
import SecurityDetails from "../../screens/SecurityDetails";

export default function SecurityRoute() {
  const { result } = useScanStatus();
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    const getLangAsync = async () => {
      const l = await getLang();
      setLang(l);
    };
    getLangAsync();
  }, []);

  // If no result exists, redirect back to scan declaratively (avoids early navigation warnings)
  if (!result) return <Redirect href="/" />;

  return (
    <View style={styles.container}>
      <SecurityDetails result={result} lang={lang} closeModal={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
