import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`p-4 rounded-md shadow-lg max-w-sm ${
            variant === 'destructive' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {title && <div className="font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      ))}
    </div>
  )
}
