// frontend/src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 py-20">
      <div className="w-14 h-14 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      <p className="mt-6 text-slate-500 font-medium">{message}</p>
    </div>
  )
}