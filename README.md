**Prueba Técnica: Desarrollador Next.js (Junior Avanzado)**
===========================================================

¡Hola! Gracias por tu interés en unirte a mi equipo. Esta prueba está diseñada para evaluar tus habilidades prácticas con Next.js (App Router), tu capacidad para resolver problemas y tu enfoque en la calidad del producto final.

**Introducción**
----------------

El proyecto es una pequeña aplicación de gestión de titulares de seguros. Actualmente, la aplicación es funcional pero carece de un diseño profesional y tiene algunas ineficiencias en el manejo de datos. Tu misión será mejorarla.

**Requisitos Previos**
----------------------

*   **Node.js** (versión 20.x o superior)
    
*   **npm** o **yarn**
    
*   Una instancia de **MySQL** corriendo localmente.
    
*   Conocimientos básicos de **Git** y **GitHub**.
    

**Configuración del Proyecto**
------------------------------

Sigue estos pasos para tener el proyecto corriendo en tu máquina local.

### **1\. Clonar el Repositorio**

Primero, haz un **fork** de este repositorio a tu propia cuenta de GitHub y luego clónalo:

git clone \[https://github.com/TU\_USUARIO/nombre-del-repositorio.git\](https://github.com/TU\_USUARIO/nombre-del-repositorio.git)cd nombre-del-repositorio

### **2\. Configuración de la Base de Datos**

1.  Abre tu cliente de MySQL y crea una nueva base de datos llamada test.CREATE DATABASE test;
    
2.  Dentro de la carpeta database/ del proyecto, encontrarás los siguientes archivos:
    

*   cgm-storage\_users.sql: Crea la tabla users.
    
*   cgm-storage\_insurance\_holders.sql: Crea la tabla insurance\_holders.
    
*   seed.sql: Inserta datos de prueba en ambas tablas (un usuario admin y 50 titulares).
    

1.  Ejecuta estos tres scripts en tu base de datos test para crear la estructura necesaria y poblarla con datos.
    

### **3\. Variables de Entorno**

Crea un archivo llamado .env.local en la raíz del proyecto y añade la siguiente variable. Asegúrate de que las credenciales coincidan con tu configuración de MySQL.

DATABASE\_URL="mysql://root:usuario@localhost:3306/test"

_(Reemplaza root y usuario si tu configuración es diferente)_.

### **4\. Instalar Dependencias y Correr la App**

Finalmente, instala las dependencias y ejecuta el servidor de desarrollo:

npm installnpm run dev

La aplicación debería estar disponible en http://localhost:3000. Puedes iniciar sesión con las credenciales:

*   **Email:** admin@example.com
    
*   **Contraseña:** admin
    

**La Tarea**
------------

El objetivo es mejorar la sección principal donde se listan los titulares de seguros. Tienes dos áreas de enfoque.

### **Reto: Rediseño de UI y Paginación**

Esta tarea tiene dos partes.

1.  **Implementación de Paginación en la Tabla:**
    

*   La tabla carga actualmente todos los registros a la vez. Debes implementar una paginación para mostrar los titulares en lotes (ej: 10 por página).
    
*   **Pista importante:** A medida que la aplicación crezca, obtener todos los datos para luego filtrarlos en el cliente será insostenible. Piensa en cómo la arquitectura de Next.js puede ayudarte a que la paginación sea eficiente y escalable desde el servidor.

1.  **Rediseño Profesional de la Interfaz (UI/UX):**
    

*   Actualmente, la aplicación utiliza componentes básicos de shadcn/ui sin mucho estilo. Tu trabajo es transformar la interfaz en un panel de control (CRM) visualmente atractivo, profesional y fácil de usar.
    
    
*   La tabla de titulares debe ser clara, legible y presentar la información más relevante a primera vista.
    
    

**¿Qué se evaluará?**
---------------------

Aunque puedes usar cualquier herramienta (incluyendo IA) para ayudarte, el resultado final y tu capacidad para justificar tus decisiones son lo más importante.

*   **Calidad del Código:** Código limpio, bien estructurado y mantenible.
    
*   **Comprensión de Next.js:** Uso correcto de Server/Client Components, estrategias de fetching de datos y manejo del estado a través de la URL (searchParams).
    
*   **Habilidades de Frontend:** Tu sentido del diseño, la atención al detalle y la creación de una experiencia de usuario fluida.
    
*   **Resolución de Problemas:** Cómo abordaste los desafíos, especialmente la implementación de la paginación.
    
*   **Manejo de Git:** El historial de commits debe ser simple pero claro y la entrega se debe hacer mediante un Pull Request.
    

**Cómo Entregar tu Prueba**
---------------------------

1.  Asegúrate de haber hecho commit de todos tus cambios en tu fork del repositorio.
    
2.  Crea un **Pull Request** desde tu fork hacia el repositorio original.
    
3.  En la descripción del Pull Request, explica brevemente las decisiones que tomaste, los desafíos que encontraste y por qué crees que tu solución es la adecuada.
    
    

¡Mucha suerte!
