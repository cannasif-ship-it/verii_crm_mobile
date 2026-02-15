import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Linking,
  LogBox,
  Image,
} from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation, Trans } from "react-i18next";
import { Text } from "../../components/ui/text";

// --- IMPORTLAR ---
import { LoginForm } from "../../features/auth";
import { setLanguage, getCurrentLanguage } from "../../locales";

// --- HUGE ICONS ---
import {
  Call02Icon,
  Globe02Icon,
  Mail02Icon,
  WhatsappIcon,
  TelegramIcon,
  InstagramIcon,
  NewTwitterIcon,
} from "hugeicons-react-native";
import { ToastAndroid as Toast } from 'react-native'

const { width, height } = Dimensions.get("window");

// --- SOSYAL MEDYA BUTONU ---
const SocialButton = ({
  icon: Icon,
  color,
  onPress,
}: {
  icon: any;
  color: string;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="w-14 h-14 rounded-full bg-white/5 border items-center justify-center"
      style={({ pressed }) => ({
        borderColor: pressed ? color : `${color}4D`,
        backgroundColor: pressed ? `${color}15` : "rgba(255, 255, 255, 0.03)",
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Icon size={24} color={color} />
    </Pressable>
  );
};

export default function LoginScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    LogBox.ignoreLogs([
      'A props object containing a "key" prop is being spread into JSX',
    ]);
  }, []);

  const toggleLanguage = async (): Promise<void> => {
    const newLang = currentLang === "tr" ? "en" : "tr";
    await setLanguage(newLang);
    setCurrentLang(newLang);
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 bg-[#0f0518]">
        {/* --- GLOW EFEKTLERİ --- */}
        <View 
          className="absolute -top-20 -left-20 bg-pink-500/10 opacity-70"
          style={{ 
            width: width * 1.1, 
            height: width * 1.1, 
            borderRadius: (width * 1.1) / 2,
            transform: [{ scale: 1.1 }] 
          }} 
        />
        <View 
          className="absolute -bottom-24 -right-20 bg-orange-500/10 opacity-70"
          style={{ 
            width: width * 1.0, 
            height: width * 1.0, 
            borderRadius: (width * 1.0) / 2 
          }} 
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <FlatListScrollView
            contentContainerStyle={{ 
                flexGrow: 1, 
                justifyContent: "space-between",
                minHeight: height 
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* --- HEADER: DİL BUTONU --- */}
            <View 
              className="px-6 items-end" 
              style={{ paddingTop: insets.top + 20 }}
            >
              <TouchableOpacity
                className="px-4 py-2 rounded-full border-[1.5px] border-white/30 bg-white/10 shadow-pink-500"
                style={{ elevation: 5 }}
                onPress={toggleLanguage}
                activeOpacity={0.7}
              >
                <Text className="text-[12px] font-[800] text-white tracking-[1px]">
                  {currentLang === "tr" ? "EN" : "TR"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- LOGO ALANI --- */}
            <View className="items-center -mt-5 -mb-11">
              <Image
                source={require("../../../assets/veriicrmlogo.png")}
                className="w-[300px] h-[150px]"
                resizeMode="contain"
              />
            </View>

            {/* --- ORTA ALAN: LOGIN KARTI --- */}
            <View className="flex-1 justify-center px-5 my-2">
              <View 
                className="bg-[#130b1b] rounded-[36px] border border-white/10 py-9 px-6 shadow-pink-500"
                style={{ elevation: 5 }}
              >
                <LoginForm />
              </View>
            </View>

            {/* --- FOOTER --- */}
            <View
              className="items-center mt-5"
              style={{ paddingBottom: insets.bottom + 30 }}
            >
              {/* İKONLAR */}
              <View className="flex-row flex-wrap justify-center gap-5 px-3 mb-4">
                <SocialButton
                  icon={Call02Icon}
                  color="#bef264"
                  onPress={() => openLink("tel:+905070123018")}
                />
                <SocialButton
                  icon={Globe02Icon}
                  color="#f472b6"
                  onPress={() => openLink("https://v3rii.com")}
                />
                <SocialButton
                  icon={Mail02Icon}
                  color="#fb923c"
                  onPress={() => openLink("mailto:info@v3rii.com")}
                />
                <SocialButton
                  icon={WhatsappIcon}
                  color="#34d399"
                  onPress={() => openLink("https://wa.me/905070123018")}
                />
                <SocialButton
                  icon={TelegramIcon}
                  color="#38bdf8"
                 onPress={() => Toast.show("Yakında...", Toast.SHORT)}
                />
                <SocialButton
                  icon={InstagramIcon}
                  color="#e879f9"
                  onPress={() => Toast.show("Yakında...", Toast.SHORT)}
                />
                <SocialButton
                  icon={NewTwitterIcon}
                  color="#ffffff"
                  onPress={() => Toast.show("Yakında...", Toast.SHORT)}
                />
              </View>

              {/* SLOGAN */}
              <View className="px-7 mt-1">
                <Text className="text-[11px] color-slate-200 text-center font-medium tracking-[3px] uppercase leading-5">
                  <Trans
                    i18nKey="auth.login.slogan"
                    defaults="İŞİNİZİ TAHMİNLERLE DEĞİL, <1>v3rii</1> 'yle YÖNETİN."
                    components={{
                      1: <Text className="font-extrabold text-pink-500 underline" />,
                    }}
                  />
                </Text>
              </View>
            </View>
          </FlatListScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}