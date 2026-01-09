import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, AlertTriangle, Search } from "lucide-react"
import { GoogleLoginButton } from "@/components/auth/google-login-button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">TruthGuard</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-balance">Detecta Noticias Falsas al Instante</h1>

          <p className="text-xl text-muted-foreground text-balance leading-relaxed">
            Verifica la credibilidad de cualquier artículo con IA avanzada. Analiza claims, revisa evidencias y obtén un
            veredicto confiable en segundos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <GoogleLoginButton />

            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent">
              <Search className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border">
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <h3 className="font-semibold mb-2">Análisis Profundo</h3>
              <p className="text-sm text-muted-foreground">Verificamos cada claim con múltiples fuentes confiables</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border">
              <AlertTriangle className="h-10 w-10 text-yellow-500 mb-3" />
              <h3 className="font-semibold mb-2">Detección IA</h3>
              <p className="text-sm text-muted-foreground">
                Algoritmos avanzados identifican patrones de desinformación
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border">
              <Shield className="h-10 w-10 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-2">Resultados Claros</h3>
              <p className="text-sm text-muted-foreground">Sistema de semáforo visual para entender al instante</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          TruthGuard © 2025 - Combatiendo la desinformación con tecnología
        </div>
      </footer>
    </div>
  )
}