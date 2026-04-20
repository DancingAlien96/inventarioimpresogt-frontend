# Frontend - Sistema de Inventario ImpresoGT

Interfaz web para gestión de inventario construida con Next.js.

## 🚀 Tecnologías

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios para peticiones HTTP
- Lucide React para iconos

## 📦 Instalación

```bash
npm install --legacy-peer-deps
```

Nota: Usamos `--legacy-peer-deps` debido a React 19 que aún no es compatible con todas las librerías.

## ⚙️ Configuración

El archivo `.env.local` ya está configurado:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Si tu backend corre en otro puerto o dominio, modifica esta variable.

## 🎯 Uso

### Modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Build para producción:

```bash
npm run build
npm start
```

## 🔐 Login

Para iniciar sesión necesitas haber creado usuarios en el backend primero.

1. Ejecuta `npm run init-usuarios` en el backend
2. Usa las credenciales por defecto:
   - Email: `cristofer@impresogt.com`
   - Password: `password123`

O las que hayas configurado en `init-usuarios.js`

## 📱 Funcionalidades

### Dashboard Principal
- ✅ Estadísticas del inventario (total productos, valor total, alertas)
- ✅ Tabla de productos con todas sus propiedades
- ✅ Alertas visuales de productos con bajo stock
- ✅ Historial de movimientos recientes

### Gestión de Productos
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Categorización (Papel, Tinta, Material Promocional, Servicios, Otros)
- ✅ Control de stock mínimo

### Movimientos
- ✅ Registrar entradas de inventario
- ✅ Registrar salidas de inventario
- ✅ Agregar notas a cada movimiento
- ✅ Actualización automática de cantidades
- ✅ Validación de stock disponible

### Seguridad
- ✅ Rutas protegidas (requieren login)
- ✅ Token JWT almacenado localmente
- ✅ Redirección automática al login si no hay sesión
- ✅ Logout con limpieza de sesión

## 📂 Estructura

```
app/
├── dashboard/
│   └── page.tsx         # Dashboard principal
├── login/
│   └── page.tsx         # Página de login
├── page.tsx             # Redirección inicial
├── layout.tsx           # Layout con AuthProvider
└── globals.css          # Estilos globales

components/
└── ProtectedRoute.tsx   # HOC para proteger rutas

contexts/
└── AuthContext.tsx      # Contexto de autenticación

lib/
└── api.ts              # Cliente axios configurado
```

## 🎨 Personalización

### Colores
Los colores principales están en Tailwind CSS. Para cambiarlos, edita las clases en los componentes:

- Azul (primario): `bg-blue-600`, `text-blue-600`
- Verde (éxito): `bg-green-600`, `text-green-600`
- Rojo (error/alertas): `bg-red-600`, `text-red-600`

### Logo
El logo "ImpresoGT" está en el header del dashboard. Para cambiarlo, edita el archivo `app/dashboard/page.tsx`.

## 🐛 Troubleshooting

**Error de conexión a la API:**
- Verifica que el backend esté corriendo en `http://localhost:5000`
- Revisa la variable `NEXT_PUBLIC_API_URL` en `.env.local`
- Abre la consola del navegador para ver errores específicos

**Error: Cannot find module:**
- Ejecuta `npm install --legacy-peer-deps` nuevamente
- Verifica que todas las dependencias estén en `package.json`

**Sesión expirada constantemente:**
- El token JWT dura 7 días por defecto
- Si el backend se reinicia, los tokens anteriores pueden invalidarse
- Haz logout y login nuevamente

**Alertas de bajo stock no aparecen:**
- Asegúrate de que los productos tengan `stockMinimo` configurado
- Las alertas solo aparecen cuando `cantidad <= stockMinimo`


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
