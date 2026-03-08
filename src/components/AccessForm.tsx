export default function AccessForm() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md space-y-5">
        <h2 className="text-2xl font-bold text-center text-gray-800">Acceso</h2>

        <div>
          <label htmlFor="email" className="block text-sm text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-300"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-indigo-300"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Ingresar
        </button>
      </form>
    </main>
  );
}
