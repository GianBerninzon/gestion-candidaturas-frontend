# Gestión de Candidaturas - Frontend

## Descripción

Este repositorio contiene el frontend de la aplicación de Gestión de Candidaturas, una herramienta diseñada para ayudar en el seguimiento de procesos de búsqueda de empleo, permitiendo registrar candidaturas, empresas y reclutadores.

## Tecnologías utilizadas

- **React**: Biblioteca para construir interfaces de usuario
- **TypeScript**: Superset tipado de JavaScript
- **Material UI**: Biblioteca de componentes para un diseño consistente
- **React Router**: Para la navegación entre páginas
- **Axios**: Cliente HTTP para realizar peticiones a la API
- **Zustand**: Gestión de estado global

## Estructura del proyecto

```
src/
├── components/      # Componentes reutilizables
├── pages/           # Páginas de la aplicación
│   ├── auth/        # Páginas de autenticación
│   ├── candidaturas/# Páginas de gestión de candidaturas
│   ├── empresas/    # Páginas de gestión de empresas
│   └── reclutadores/# Páginas de gestión de reclutadores
├── routes/          # Configuración de rutas
├── services/        # Servicios para comunicación con la API
├── store/           # Gestión de estado global
├── theme/           # Configuración del tema
└── types/           # Definiciones de tipos TypeScript
```

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/GianBerninzon/gestion-candidaturas-frontend.git
   cd gestion-candidaturas-frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Conexión con el backend

Este frontend está diseñado para trabajar con el backend de Gestión de Candidaturas. Asegúrate de tener el backend en funcionamiento antes de utilizar esta aplicación.

- Repositorio del backend: [https://github.com/GianBerninzon/gestion-candidaturas](https://github.com/GianBerninzon/gestion-candidaturas)
- Documentación técnica completa: [Documentación Técnica del Sistema](https://github.com/GianBerninzon/gestion-candidaturas/blob/v1.0/docs/Documentaci%C3%B3n%20T%C3%A9cnica%20del%20Sistema.pdf)

## Funcionalidades principales

- **Gestión de candidaturas**: Registro, visualización, edición y seguimiento de candidaturas a empleos
- **Gestión de empresas**: Registro y consulta de información de empresas
- **Gestión de reclutadores**: Registro y seguimiento de contactos con reclutadores
- **Autenticación**: Sistema de login y registro de usuarios

## Desarrollo

### Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Genera la versión de producción
- `npm run lint`: Ejecuta el linter para verificar la calidad del código
- `npm run preview`: Previsualiza la versión de producción localmente

## Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
