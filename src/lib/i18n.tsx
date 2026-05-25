import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "pt-pt" | "en" | "es" | "fr";

export const translations = {
  "pt-pt": {
    readyToSpin: "Pronto para girar?",
    enterDetails: "Introduza os seus dados abaixo para desbloquear a sua recompensa.",
    email: "E-mail *",
    nameOptional: "Nome (Opcional)",
    phoneOptional: "Telefone (Opcional)",
    consentText: "Concordo em receber o prémio e materiais de marketing por e-mail. Posso cancelar a subscrição a qualquer momento.",
    continueToSpin: "Continuar para Girar",
    tapToSpin: "TOQUE PARA GIRAR",
    prizeReady: "O seu prémio está pronto! Clique na roda para descobrir o que ganhou.",
    spinning: "A girar pelo seu prémio...",
    soClose: "Quase lá!",
    noPrizeText: "Infelizmente, não ganhou desta vez. Mas não se preocupe, pode tentar novamente!",
    tryAgain: "Tentar Novamente",
    congratulations: "Parabéns!",
    youWon: "Ganhou:",
    yourCode: "O seu Código",
    checkEmail: "Verifique o seu e-mail! Enviámos os detalhes do seu prémio.",
    loading: "A carregar...",
    validationEmail: "Por favor, introduza um endereço de e-mail válido.",
    validationConsent: "Deve dar o seu consentimento para participar.",
  },
  en: {
    readyToSpin: "Ready to Spin?",
    enterDetails: "Enter your details below to unlock your reward.",
    email: "Email *",
    nameOptional: "Name (Optional)",
    phoneOptional: "Phone (Optional)",
    consentText: "I agree to receive the prize and marketing materials via email. I can unsubscribe at any time.",
    continueToSpin: "Continue to Spin",
    tapToSpin: "TAP TO SPIN",
    prizeReady: "Your prize is ready! Click the wheel to find out what you won.",
    spinning: "Spinning for your prize...",
    soClose: "So Close!",
    noPrizeText: "Unfortunately, you didn't win this time. But don't worry, you can try again!",
    tryAgain: "Try Again",
    congratulations: "Congratulations!",
    youWon: "You've won:",
    yourCode: "Your Code",
    checkEmail: "Check your email! We've sent your prize details to you.",
    loading: "Loading...",
    validationEmail: "Please enter a valid email address.",
    validationConsent: "You must consent to participate.",
  },
  es: {
    readyToSpin: "¿Listo para girar?",
    enterDetails: "Introduce tus datos a continuación para desbloquear tu recompensa.",
    email: "Correo electrónico *",
    nameOptional: "Nombre (Opcional)",
    phoneOptional: "Teléfono (Opcional)",
    consentText: "Acepto recibir el premio y materiales de marketing por correo electrónico. Puedo cancelar la suscripción en cualquier momento.",
    continueToSpin: "Continuar para girar",
    tapToSpin: "TOQUE PARA GIRAR",
    prizeReady: "¡Tu premio está listo! Haz clic en la rueda para descubrir lo que has ganado.",
    spinning: "Girando por tu premio...",
    soClose: "¡Por poco!",
    noPrizeText: "Desafortunadamente, no has ganado esta vez. ¡Pero no te preocupes, puedes intentarlo de nuevo!",
    tryAgain: "Intentar de nuevo",
    congratulations: "¡Felicidades!",
    youWon: "Has ganado:",
    yourCode: "Tu Código",
    checkEmail: "¡Revisa tu correo electrónico! Te hemos enviado los detalles de tu premio.",
    loading: "Cargando...",
    validationEmail: "Por favor introduzca un correo electrónico válido.",
    validationConsent: "Debe aceptar los términos para participar.",
  },
  fr: {
    readyToSpin: "Prêt à tourner ?",
    enterDetails: "Entrez vos coordonnées ci-dessous pour débloquer votre récompense.",
    email: "E-mail *",
    nameOptional: "Nom (Optionnel)",
    phoneOptional: "Téléphone (Optionnel)",
    consentText: "J'accepte de recevoir le prix et le matériel de marketing par e-mail. Je peux me désabonner à tout moment.",
    continueToSpin: "Continuer pour tourner",
    tapToSpin: "TAPPER POUR TOURNER",
    prizeReady: "Votre prix est prêt ! Cliquez sur la roue pour découvrir ce que vous avez gagné.",
    spinning: "Tourner pour votre prix...",
    soClose: "Si proche !",
    noPrizeText: "Malheureusement, vous n'avez pas gagné cette fois-ci. Mais ne vous inquiétez pas, vous pouvez réessayer !",
    tryAgain: "Réessayer",
    congratulations: "Félicitations !",
    youWon: "Vous avez gagné :",
    yourCode: "Votre Code",
    checkEmail: "Vérifiez vos e-mails ! Nous vous avons envoyé les détails de votre prix.",
    loading: "Chargement...",
    validationEmail: "Veuillez entrer une adresse e-mail valide.",
    validationConsent: "Vous devez consentir pour participer.",
  },
};

export type TranslationKey = keyof typeof translations["pt-pt"];

interface I18nContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function LanguageProvider({ children, defaultLocale }: { children: React.ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale || "pt-pt");

  // Synchronize locale state if defaultLocale prop changes
  useEffect(() => {
    if (defaultLocale) {
      setLocale(defaultLocale);
    }
  }, [defaultLocale]);

  // Keep a client-side sync of locale settings if preferred (e.g. from local storage)
  useEffect(() => {
    if (typeof window !== "undefined" && !defaultLocale) {
      const saved = localStorage.getItem("leadmagnet_locale") as Locale;
      if (saved && translations[saved]) {
        setLocale(saved);
      }
    }
  }, [defaultLocale]);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("leadmagnet_locale", newLocale);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations["pt-pt"][key] || (key as string);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for non-wrapped contexts (e.g. in basic testing)
    return {
      locale: "pt-pt" as Locale,
      setLocale: () => {},
      t: (key: TranslationKey) => translations["pt-pt"][key] || (key as string),
    };
  }
  return context;
}
