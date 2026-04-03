export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Área Protegida do Inquilino
      </h1>
      <p className="mt-4 text-gray-600">
        Bem-vindo ao dashboard privado Enterprise. Seu acesso corporativo foi verificado via JWT Guard.
      </p>
    </div>
  );
}
