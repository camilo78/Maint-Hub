Maint-Hub 🔩
============

Un moderno Sistema de Gestión de Mantenimiento (CMMS) construido con **Laravel 12** y **React 19**. Diseñado para simplificar la administración de órdenes de trabajo, conectando clientes, técnicos y administradores en una plataforma centralizada y eficiente.

📝 Descripción
--------------

**Maint-Hub** es una solución de software como servicio (SaaS) que digitaliza el flujo de trabajo de mantenimiento. Permite a los clientes generar solicitudes de servicio de forma intuitiva, mientras que el personal de la empresa puede gestionar, asignar y monitorear cada orden de trabajo en tiempo real, optimizando la comunicación y los tiempos de respuesta.

Este proyecto utiliza una arquitectura robusta, con una API RESTful en el backend construida con el ecosistema de Laravel, y una interfaz de usuario dinámica y reactiva desarrollada con lo último de React y Vite.

✨ Características Principales
-----------------------------

*   **🏢 Portal de Clientes:** Interfaz limpia para que los clientes puedan registrarse, crear nuevas solicitudes de servicio, y consultar el estado e historial de sus mantenimientos.
    
*   **👨‍🔧 Panel de Técnicos:** Un espacio de trabajo para que los técnicos visualicen las órdenes asignadas, actualicen su estado (ej. "En progreso", "Completado"), y adjunten notas técnicas.
    
*   **⚙️ Gestión Centralizada:** El administrador puede supervisar todas las órdenes de trabajo, asignarlas a técnicos específicos, y obtener una visión completa del ciclo de vida de cada tarea.
    
*   **🔐 Roles y Permisos Avanzados:** Sistema de autenticación seguro con Laravel Sanctum y gestión de roles detallada (Admin, Técnico, Cliente) gracias a spatie/laravel-permission.
    
*   **🎨 Interfaz Moderna:** Componentes de interfaz de usuario elegantes y funcionales construidos con **Shadcn UI** y **Tailwind CSS**.
    

🛠️ Stack Tecnológico
---------------------

La aplicación está construida con un stack moderno y potente:

-   **Backend:** **PHP** con **Laravel 12**
    
-   **Frontend:** **React 19** con **Vite**
    
-   **Base de Datos:** Compatible con **MySQL** y **PostgreSQL**
    
-   **API:** Arquitectura **RESTful**
    
-   **Autenticación:** **Laravel Sanctum**
    
-   **Autorización:** **Spatie Laravel Permission**
    
-   **UI/Estilos:** **Tailwind CSS** y **Shadcn UI**
    

🚀 Instalación y Puesta en Marcha
---------------------------------

Sigue estos pasos para configurar el proyecto en tu entorno de desarrollo local.

### **Prerrequisitos**

*   PHP >= 8.2
    
*   Composer
    
*   Node.js >= 18.0
    
*   NPM o Yarn
    
*   Un servidor de base de datos (MySQL, PostgreSQL)
    

### **1\. Clonar el Repositorio**

Bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   git clone https://github.com/camilo78/Maint-Hub.git  cd Maint-Hub   `

### **2\. Configuración del Backend (Laravel)**

Bash

  # Navega a la carpeta del backend  cd backend  
  # Instala las dependencias de PHP  composer install  
  # Copia el archivo de variables de entorno  cp .env.example .env  
  # Genera la clave de la aplicación  php artisan key:generate  
  # Configura tus credenciales de base de datos en el archivo .env  # DB_CONNECTION=mysql  # DB_HOST=127.0.0.1  # DB_PORT=3306  # DB_DATABASE=maint_hub  # DB_USERNAME=root  # DB_PASSWORD=  # Ejecuta las migraciones y los seeders para poblar la base de datos con datos de prueba  php artisan migrate --seed  # Inicia el servidor del backend  php artisan serve   `

Tu API estará disponible en http://localhost:8000.

### **3\. Configuración del Frontend (React)**

Bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Regresa a la raíz y navega a la carpeta del frontend  cd ../frontend  # Instala las dependencias de JavaScript  npm install  # (Opcional) Crea un archivo .env.local para apuntar a la URL de tu API  # VITE_API_BASE_URL=http://localhost:8000/api  # Inicia el servidor de desarrollo de Vite  npm run dev   `

Tu aplicación de React estará disponible en la URL que indique Vite (generalmente http://localhost:5173).

🤝 Contribuciones
-----------------

Las contribuciones son más que bienvenidas. Si tienes una idea para mejorar el proyecto, por favor, abre un _issue_ para discutirlo o envía directamente un _Pull Request_ con tus cambios.

📄 Licencia
-----------

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.