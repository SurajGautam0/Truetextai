import Header from "@/components/header"
import { ThemeSettings } from "@/components/theme-settings"

export default function ThemePage() {
  return (
    <>
      <Header title="Theme Settings" />
      <main className="flex-1 overflow-auto p-6">
        <ThemeSettings />
      </main>
    </>
  )
}
