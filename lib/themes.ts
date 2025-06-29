export interface Theme {
  id: string
  name: string
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
    success: string
    successForeground: string
    warning: string
    warningForeground: string
  }
  borderRadius?: number
}

export const defaultTheme: Theme = {
  id: "default",
  name: "Default",
  colors: {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    card: "0 0% 100%",
    cardForeground: "222.2 84% 4.9%",
    popover: "0 0% 100%",
    popoverForeground: "222.2 84% 4.9%",
    primary: "262 83% 58%",
    primaryForeground: "210 40% 98%",
    secondary: "262 83% 96%",
    secondaryForeground: "222.2 47.4% 11.2%",
    muted: "210 40% 96.1%",
    mutedForeground: "215.4 16.3% 46.9%",
    accent: "262 83% 96%",
    accentForeground: "222.2 47.4% 11.2%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "210 40% 98%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "262 83% 58%",
    success: "142.1 76.2% 36.3%",
    successForeground: "355.7 100% 97.3%",
    warning: "38 92% 50%",
    warningForeground: "48 96% 89%",
  },
  borderRadius: 0.75,
}

export const darkTheme: Theme = {
  id: "dark",
  name: "Dark",
  colors: {
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    card: "222.2 84% 4.9%",
    cardForeground: "210 40% 98%",
    popover: "222.2 84% 4.9%",
    popoverForeground: "210 40% 98%",
    primary: "263 70% 60%",
    primaryForeground: "222.2 47.4% 11.2%",
    secondary: "217.2 32.6% 17.5%",
    secondaryForeground: "210 40% 98%",
    muted: "217.2 32.6% 17.5%",
    mutedForeground: "215 20.2% 65.1%",
    accent: "217.2 32.6% 17.5%",
    accentForeground: "210 40% 98%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "210 40% 98%",
    border: "217.2 32.6% 17.5%",
    input: "217.2 32.6% 17.5%",
    ring: "263 70% 60%",
    success: "142.1 70.6% 45.3%",
    successForeground: "144.9 80.4% 10%",
    warning: "48 96% 89%",
    warningForeground: "38 92% 50%",
  },
  borderRadius: 0.75,
}

export const blueTheme: Theme = {
  id: "blue",
  name: "Blue",
  colors: {
    background: "210 40% 98%",
    foreground: "222.2 84% 4.9%",
    card: "210 40% 98%",
    cardForeground: "222.2 84% 4.9%",
    popover: "210 40% 98%",
    popoverForeground: "222.2 84% 4.9%",
    primary: "221.2 83.2% 53.3%",
    primaryForeground: "210 40% 98%",
    secondary: "210 40% 96.1%",
    secondaryForeground: "222.2 47.4% 11.2%",
    muted: "210 40% 96.1%",
    mutedForeground: "215.4 16.3% 46.9%",
    accent: "210 40% 96.1%",
    accentForeground: "222.2 47.4% 11.2%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "210 40% 98%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "221.2 83.2% 53.3%",
    success: "142.1 76.2% 36.3%",
    successForeground: "355.7 100% 97.3%",
    warning: "38 92% 50%",
    warningForeground: "48 96% 89%",
  },
  borderRadius: 0.5,
}

export const blueDarkTheme: Theme = {
  id: "blue-dark",
  name: "Blue Dark",
  colors: {
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    card: "222.2 84% 4.9%",
    cardForeground: "210 40% 98%",
    popover: "222.2 84% 4.9%",
    popoverForeground: "210 40% 98%",
    primary: "217.2 91.2% 59.8%",
    primaryForeground: "222.2 47.4% 11.2%",
    secondary: "217.2 32.6% 17.5%",
    secondaryForeground: "210 40% 98%",
    muted: "217.2 32.6% 17.5%",
    mutedForeground: "215 20.2% 65.1%",
    accent: "217.2 32.6% 17.5%",
    accentForeground: "210 40% 98%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "210 40% 98%",
    border: "217.2 32.6% 17.5%",
    input: "217.2 32.6% 17.5%",
    ring: "224.3 76.3% 48%",
    success: "142.1 70.6% 45.3%",
    successForeground: "144.9 80.4% 10%",
    warning: "48 96% 89%",
    warningForeground: "38 92% 50%",
  },
  borderRadius: 0.5,
}

export const greenTheme: Theme = {
  id: "green",
  name: "Green",
  colors: {
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    card: "0 0% 100%",
    cardForeground: "240 10% 3.9%",
    popover: "0 0% 100%",
    popoverForeground: "240 10% 3.9%",
    primary: "142.1 76.2% 36.3%",
    primaryForeground: "355.7 100% 97.3%",
    secondary: "240 4.8% 95.9%",
    secondaryForeground: "240 5.9% 10%",
    muted: "240 4.8% 95.9%",
    mutedForeground: "240 3.8% 46.1%",
    accent: "240 4.8% 95.9%",
    accentForeground: "240 5.9% 10%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "0 0% 98%",
    border: "240 5.9% 90%",
    input: "240 5.9% 90%",
    ring: "142.1 76.2% 36.3%",
    success: "142.1 76.2% 36.3%",
    successForeground: "355.7 100% 97.3%",
    warning: "38 92% 50%",
    warningForeground: "48 96% 89%",
  },
  borderRadius: 0.75,
}

export const greenDarkTheme: Theme = {
  id: "green-dark",
  name: "Green Dark",
  colors: {
    background: "20 14.3% 4.1%",
    foreground: "0 0% 95%",
    card: "24 9.8% 10%",
    cardForeground: "0 0% 95%",
    popover: "0 0% 9%",
    popoverForeground: "0 0% 95%",
    primary: "142.1 70.6% 45.3%",
    primaryForeground: "144.9 80.4% 10%",
    secondary: "240 3.7% 15.9%",
    secondaryForeground: "0 0% 98%",
    muted: "0 0% 15%",
    mutedForeground: "240 5% 64.9%",
    accent: "12 6.5% 15.1%",
    accentForeground: "0 0% 98%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "0 85.7% 97.3%",
    border: "240 3.7% 15.9%",
    input: "240 3.7% 15.9%",
    ring: "142.4 71.8% 29.2%",
    success: "142.1 70.6% 45.3%",
    successForeground: "144.9 80.4% 10%",
    warning: "48 96% 89%",
    warningForeground: "38 92% 50%",
  },
  borderRadius: 0.75,
}

export const redTheme: Theme = {
  id: "red",
  name: "Red",
  colors: {
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    card: "0 0% 100%",
    cardForeground: "240 10% 3.9%",
    popover: "0 0% 100%",
    popoverForeground: "240 10% 3.9%",
    primary: "0 84.2% 60.2%",
    primaryForeground: "0 0% 98%",
    secondary: "240 4.8% 95.9%",
    secondaryForeground: "240 5.9% 10%",
    muted: "240 4.8% 95.9%",
    mutedForeground: "240 3.8% 46.1%",
    accent: "240 4.8% 95.9%",
    accentForeground: "240 5.9% 10%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "0 0% 98%",
    border: "240 5.9% 90%",
    input: "240 5.9% 90%",
    ring: "0 84.2% 60.2%",
    success: "142.1 76.2% 36.3%",
    successForeground: "355.7 100% 97.3%",
    warning: "38 92% 50%",
    warningForeground: "48 96% 89%",
  },
  borderRadius: 0.5,
}

export const redDarkTheme: Theme = {
  id: "red-dark",
  name: "Red Dark",
  colors: {
    background: "20 14.3% 4.1%",
    foreground: "0 0% 95%",
    card: "24 9.8% 10%",
    cardForeground: "0 0% 95%",
    popover: "0 0% 9%",
    popoverForeground: "0 0% 95%",
    primary: "0 72.2% 50.6%",
    primaryForeground: "0 85.7% 97.3%",
    secondary: "240 3.7% 15.9%",
    secondaryForeground: "0 0% 98%",
    muted: "0 0% 15%",
    mutedForeground: "240 5% 64.9%",
    accent: "12 6.5% 15.1%",
    accentForeground: "0 0% 98%",
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "0 85.7% 97.3%",
    border: "240 3.7% 15.9%",
    input: "240 3.7% 15.9%",
    ring: "0 72.2% 50.6%",
    success: "142.1 70.6% 45.3%",
    successForeground: "144.9 80.4% 10%",
    warning: "48 96% 89%",
    warningForeground: "38 92% 50%",
  },
  borderRadius: 0.5,
}

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  dark: darkTheme,
  blue: blueTheme,
  "blue-dark": blueDarkTheme,
  green: greenTheme,
  "green-dark": greenDarkTheme,
  red: redTheme,
  "red-dark": redDarkTheme,
}
