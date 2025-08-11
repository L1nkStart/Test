import React from "react"
import { Header } from "@/components/layout/Header"

export default function AyudaPage() {
  return (
    <>
      <Header 
        pageDescription="Centro de ayuda y documentación"
      />
      
      <div className="px-6 py-6">
        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Centro de Ayuda
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Documentación y recursos de ayuda estarán disponibles próximamente.
          </p>
        </div>
      </div>
    </>
  )
}