import { FC } from "react";
import { StyleSheet, Linking } from "react-native";
import * as Application from "expo-application";
import { ThemedText, ThemedView } from "@/components/Themed";

const About: FC = () => {
    return (
        <ThemedView style={styles.left}>
            <ThemedText style={styles.title}>
                {Application.applicationName}{" "}
                {Application.nativeApplicationVersion} (build{" "}
                {Application.nativeBuildVersion})
            </ThemedText>
            <ThemedText
                style={styles.title}
                onPress={() => Linking.openURL("https://www.stelau.com")}
            >
                ©️ {new Date().getFullYear()} Stelau
            </ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    left: {
        flex: 1,
    },
    title: {
        textAlign: "left",
        margin: 20,
    },
});

export default About;
