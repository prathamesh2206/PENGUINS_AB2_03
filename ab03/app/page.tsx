import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Stethoscope, ClipboardList } from "lucide-react"

export default function Home() {
  return (
    <div className="container flex flex-col items-center py-8 md:py-12">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-accent">
              AI-Powered Clinical Support
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Empower clinicians with AI-driven insights for better patient outcomes
            </p>
            <Link href="/signin" passHref>
              <Button size="lg" className="neo-button">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 text-accent">Features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="neo-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get evidence-based clinical recommendations powered by advanced AI algorithms trained on the latest
                  medical literature.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="neo-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-6 w-6" />
                  Clinical Decision Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access real-time support for diagnosis, treatment planning, and medication management at the point of
                  care.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="neo-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-6 w-6" />
                  Patient Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Efficiently manage patient records, medical history, and treatment plans in one integrated platform.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

