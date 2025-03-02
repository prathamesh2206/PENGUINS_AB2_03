"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, User, FileText, Pill, Activity, Heart, Zap } from "lucide-react"
import { PatientProvider, usePatient } from "@/context/patient-context"

function ChatbotInterface() {
  const { patients, currentPatient, searchPatient, setCurrentPatient } = usePatient()
  const [searchQuery, setSearchQuery] = useState("")
  const [clinicalQuery, setClinicalQuery] = useState("")
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const patient = searchPatient(searchQuery)
    if (patient) {
      setCurrentPatient(patient)
    } else {
      alert("Patient not found")
    }
  }

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPatient) {
      alert("Please select a patient first")
      return
    }

    setIsLoading(true)

    try {
      const response= await axios.post("https://localhost:3000/api/medical-query", {
      symptoms: clinicalQuery,
        diseases: currentPatient.medicalHistory,
        medications: currentPatient.medications
     })
     const ACSResponse = ({ response, setRecommendation  }) => {
      if (response.status === 200) {
        setRecommendation(`
          <div>
            <p><strong>Confidence:</strong> ${response.confidence}</p>
            <h3 class="text-lg font-bold mt-4">Primary Recommendation:</h3>
            <p>Initiate ACS protocol and proceed with:</p>
            <ol class="list-decimal pl-5 mt-2">
              ${response.recommendations.map((item, index) => `<li key=${index}>${item}</li>`).join('')}
            </ol>
            <h3 class="text-lg font-bold mt-4">Supporting Evidence:</h3>
            <p>${response.evidence}</p>
          </div>
        `);
        setIsLoading(false)
      }
      return null;

    };
      ACSResponse(response.data , setRecommendation());
      
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r bg-[hsl(var(--sidebar-bg))] p-4">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Input
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button type="submit" size="icon" className="absolute right-0 top-0 h-full rounded-l-none">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {currentPatient ? (
          <Card className="neo-card">
            <CardHeader>
              <CardTitle className="text-lg text-accent">Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium">{currentPatient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPatient.age} years, {currentPatient.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                <p>Blood Type: {currentPatient.bloodGroup}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <p className="font-medium">Medical History</p>
                </div>
                <ul className="ml-7 list-disc text-sm space-y-1">
                  {currentPatient.medicalHistory.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-accent" />
                  <p className="font-medium">Current Medications</p>
                </div>
                <ul className="ml-7 list-disc text-sm space-y-1">
                  {currentPatient.medications.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <User className="h-12 w-12 mb-2 opacity-50" />
            <p>Search for a patient or select from the patients list</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-accent">Clinical Query</h1>

        <form onSubmit={handleQuerySubmit} className="mb-8">
          <Textarea
            placeholder="Describe the patient's symptoms, concerns, or clinical question..."
            value={clinicalQuery}
            onChange={(e) => setClinicalQuery(e.target.value)}
            className="mb-4 min-h-[150px]"
          />
          <Button type="submit" disabled={!currentPatient || isLoading} className="neo-button">
            {isLoading ? "Processing..." : "Submit Query"}
          </Button>
        </form>

        {recommendation ? (
          <Card className="neo-card">
            <CardHeader className="flex flex-row items-center gap-2">
              <Heart className="h-6 w-6 text-accent" />
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: recommendation }} />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Zap className="h-12 w-12 mb-2 opacity-50" />
            <p>Submit a clinical query to get AI-powered recommendations</p>
          </div>
        )}
      </div>

      {/* Right Navigation */}
      <div className="w-12 border-l bg-[hsl(var(--sidebar-bg))] flex flex-col items-center py-4">
        <Button variant="ghost" size="icon" className="mb-4">
          <Heart className="h-5 w-5 text-accent" />
        </Button>
        <Button variant="ghost" size="icon" className="mb-4">
          <FileText className="h-5 w-5 text-accent" />
        </Button>
        <Button variant="ghost" size="icon">
          <Activity className="h-5 w-5 text-accent" />
        </Button>
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  return (
    <PatientProvider>
      <ChatbotInterface />
    </PatientProvider>
  )
}

