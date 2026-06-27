export default function Header({ user }: { user: { email?: string } }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
          {user.email?.[0].toUpperCase() || 'D'}
        </div>
      </div>
    </header>
  )
}