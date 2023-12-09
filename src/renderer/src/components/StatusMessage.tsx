export default function StatusMessage({ message }: { message: string }) {
  return (
    <div className="px-4">
      <div role="alert" className="p-4 border-2 rounded-xl bg-green-700 flex gap-2 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-white">Status: {message}</span>
      </div>
    </div>
  )
}
