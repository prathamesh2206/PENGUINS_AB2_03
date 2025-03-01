"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Patient {
  id: number
  name: string
  age: number
  gender: string
  bloodGroup: string
  medicalHistory: string[]
  medications: string[]
}

interface PatientContextType {
  patients: Patient[]
  currentPatient: Patient | null
  addPatient: (patient: Omit<Patient, "id">) => void
  setCurrentPatient: (patient: Patient | null) => void
  searchPatient: (name: string) => Patient | null
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

// Mock data
const initialPatients: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    age: 67,
    gender: "Male",
    bloodGroup: "A+",
    medicalHistory: [
      "Hypertension (10 years)",
      "Type 2 Diabetes (5 years)",
      "Coronary Artery Disease",
      "Cholecystectomy (2018)",
    ],
    medications: ["Metformin 1000mg BID", "Lisinopril 20mg daily", "Atorvastatin 40mg daily"],
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 54,
    gender: "Female",
    bloodGroup: "O-",
    medicalHistory: ["Asthma", "Hypothyroidism"],
    medications: ["Levothyroxine 75mcg daily", "Albuterol inhaler PRN"],
  },
  {
    id: 3,
    name: "Robert Johnson",
    age: 72,
    gender: "Male",
    bloodGroup: "B+",
    medicalHistory: ["Atrial Fibrillation", "COPD", "Osteoarthritis"],
    medications: ["Apixaban 5mg BID", "Tiotropium inhaler daily", "Acetaminophen 500mg PRN"],
  },
]

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)

  const addPatient = (patient: Omit<Patient, "id">) => {
    const newPatient = {
      ...patient,
      id: patients.length + 1,
    }
    setPatients([...patients, newPatient])
  }

  const searchPatient = (name: string): Patient | null => {
    const patient = patients.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))
    return patient || null
  }

  return (
    <PatientContext.Provider
      value={{
        patients,
        currentPatient,
        addPatient,
        setCurrentPatient,
        searchPatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider")
  }
  return context
}

