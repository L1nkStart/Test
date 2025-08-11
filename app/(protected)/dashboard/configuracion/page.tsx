import React from "react"
import { Header } from "@/components/layout/Header"

export default function ConfiguracionPage() {
  return (
    <>
      <Header 
        pageDescription="Configuración del sistema y usuarios"
      />
      
      <div className="px-6 py-6">
        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Módulo en Desarrollo
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            La configuración estará disponible próximamente.
          </p>
        </div>
      </div>
    </>
  )
}