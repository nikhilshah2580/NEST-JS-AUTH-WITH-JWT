import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4500);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === "error";

  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
        isError ? "border-[#efd3cd]" : "border-[#dce8d6]"
      }`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <span
        aria-hidden="true"
        className={`grid size-6 shrink-0 place-items-center rounded-full text-sm font-bold ${
          isError
            ? "bg-[#f8e9e5] text-[#a14e42]"
            : "bg-[#e8eee3] text-[#416e50]"
        }`}
      >
        {isError ? "!" : "✓"}
      </span>
      <p className="min-w-0 flex-1 pt-0.5 text-sm leading-5 text-[#39483a]">
        {toast.message}
      </p>
      <button
        className="shrink-0 rounded px-1 text-lg leading-5 text-[#737a70] hover:text-[#202820]"
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current.slice(-2), { id, message, type }]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
        aria-label="Notifications"
        role="region"
      >
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context.showToast;
}
