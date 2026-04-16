import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/ui/toast";
import { useUIStore } from "@/stores/uiStore";

export function GlobalToast() {
  const toasts = useUIStore((state) => state.toasts);


  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2 max-w-sm w-full max-h-[80vh] overflow-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.95,
              transition: { duration: 0.2 },
            }}
            className="pointer-events-auto"
          >
            <Toast
              message={toast.message}
              type={toast.type === "error" ? "error" : "success"}
              role={toast.type === "error" ? "alert" : "status"}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
