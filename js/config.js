/* ============================================================
   Configuración de Supabase
   ------------------------------------------------------------
   1. Crea un proyecto gratis en https://supabase.com
   2. Project Settings → API → copia "Project URL" y la clave "anon public"
   3. Pégalas abajo y guarda.
   4. Ejecuta el SQL de  supabase/schema.sql  en el SQL Editor de Supabase.

   Si dejas estos campos vacíos, la app funciona en MODO LOCAL
   (los datos se guardan solo en este navegador).
   ============================================================ */
window.BYTEC_CONFIG = {
  supabaseUrl: "",   // ej: "https://xxxxxxxx.supabase.co"
  supabaseKey: ""    // ej: "eyJhbGciOiJI...". Usa la clave ANON (pública), nunca la service_role.
};
