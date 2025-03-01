"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

interface SignInFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  hospital: string
  department: string
}

const hospitals = [
  "General Hospital",
  "City Medical Center",
  "University Hospital",
  "Memorial Hospital",
  "Regional Medical Center",
]

const departments = [
  "Cardiology",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Radiology",
]

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignInFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospital: "",
    department: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data submitted:", formData)
    router.push("/patients")
  }

  const selectHospital = (hospital: string) => {
    setFormData((prev) => ({ ...prev, hospital }))
  }

  const selectDepartment = (department: string) => {
    setFormData((prev) => ({ ...prev, department }))
  }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-md neo-card">
        <CardHeader>
          <CardTitle className="text-2xl text-accent">Sign In</CardTitle>
          <CardDescription>Register as hospital staff to access the Clinical Decision Support System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username / Staff ID
              </label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="hospital" className="text-sm font-medium">
                Hospital
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formData.hospital || "Select Hospital"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {hospitals.map((hospital) => (
                    <DropdownMenuItem key={hospital} onClick={() => selectHospital(hospital)}>
                      {hospital}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formData.department || "Select Department"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {departments.map((department) => (
                    <DropdownMenuItem key={department} onClick={() => selectDepartment(department)}>
                      {department}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button type="submit" className="w-full neo-button">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/patients" className="text-sm text-accent hover:underline">
            Already have an account? Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

