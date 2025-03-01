"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus, X } from "lucide-react"
import { PatientProvider, usePatient, type Patient } from "@/context/patient-context"

interface PatientFormData {
  name: string
  age: string
  gender: string
  bloodGroup: string
  medicalHistory: string
  medications: string
}

const genders = ["Male", "Female", "Other"]
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

function PatientsList() {
  const { patients, addPatient, setCurrentPatient } = usePatient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    medicalHistory: "",
    medications: "",
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert form data to patient object
    const newPatient: Omit<Patient, "id"> = {
      name: formData.name,
      age: Number.parseInt(formData.age),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      medicalHistory: formData.medicalHistory.split("\n").filter((item) => item.trim() !== ""),
      medications: formData.medications.split("\n").filter((item) => item.trim() !== ""),
    }

    addPatient(newPatient)
    setIsModalOpen(false)
    setFormData({
      name: "",
      age: "",
      gender: "",
      bloodGroup: "",
      medicalHistory: "",
      medications: "",
    })
  }

  const handlePatientClick = (patient: Patient) => {
    setCurrentPatient(patient)
    router.push("/chatbot")
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Patients</h1>
        <Button onClick={() => setIsModalOpen(true)} className="neo-button">
          <Plus className="mr-2 h-4 w-4" /> Create New Patient
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card key={patient.id} className="neo-card cursor-pointer" onClick={() => handlePatientClick(patient)}>
            <CardHeader>
              <CardTitle className="text-xl text-accent">{patient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Age:</span> {patient.age}
                </p>
                <p>
                  <span className="font-medium">Gender:</span> {patient.gender}
                </p>
                <p>
                  <span className="font-medium">Blood Group:</span> {patient.bloodGroup}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto neo-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-accent">Create New Patient</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium">
                  Age
                </label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData.gender || "Select Gender"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {genders.map((gender) => (
                      <DropdownMenuItem key={gender} onClick={() => setFormData((prev) => ({ ...prev, gender }))}>
                        {gender}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <label htmlFor="bloodGroup" className="text-sm font-medium">
                  Blood Group
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData.bloodGroup || "Select Blood Group"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {bloodGroups.map((bloodGroup) => (
                      <DropdownMenuItem
                        key={bloodGroup}
                        onClick={() => setFormData((prev) => ({ ...prev, bloodGroup }))}
                      >
                        {bloodGroup}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <label htmlFor="medicalHistory" className="text-sm font-medium">
                  Medical History
                </label>
                <Textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  placeholder="Enter each condition on a new line"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="medications" className="text-sm font-medium">
                  Current Medications
                </label>
                <Textarea
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  placeholder="Enter each medication on a new line"
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" className="w-full neo-button">
                Create Patient
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PatientsPage() {
  return (
    <PatientProvider>
      <PatientsList />
    </PatientProvider>
  )
}

