import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en"); // Default to English

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("lang");
        if (savedLang) {
          setLang(savedLang);
        } else {
          const defaultLang = getLocales()[0].languageCode;
          setLang(defaultLang);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLang) => {
    // Update the state immediately
    setLang(newLang);

    // Save the new language to AsyncStorage
    try {
      await AsyncStorage.setItem("lang", newLang);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
