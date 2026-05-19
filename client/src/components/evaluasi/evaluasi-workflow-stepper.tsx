import { Check } from 'lucide-react'
import type { StatusPengajuanEvaluasi } from '@/types/dto/evaluasi.dto'
import { buildEvaluasiWorkflowSteps } from '@/lib/evaluasi/evaluasi-workflow-stepper'
import { cn } from '@/utils/cn'

export interface EvaluasiWorkflowStepperProps {
  status: StatusPengajuanEvaluasi | string
  className?: string
}

export function EvaluasiWorkflowStepper({ status, className }: EvaluasiWorkflowStepperProps) {
  const steps = buildEvaluasiWorkflowSteps(status)
  return (
    <ol
      className={cn(
        'flex flex-wrap items-start gap-x-1 gap-y-2 text-[10px] sm:text-xs',
        className,
      )}
      aria-label="Alur pengajuan evaluasi"
    >
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-1 min-w-0">
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
              step.state === 'done' && 'border-emerald-500 bg-emerald-500 text-white',
              step.state === 'current' && 'border-blue-600 bg-blue-50 text-blue-800',
              step.state === 'upcoming' && 'border-gray-200 bg-white text-gray-400',
            )}
          >
            {step.state === 'done' ? (
              <Check className="h-3 w-3" aria-hidden />
            ) : (
              step.id
            )}
          </span>
          <span
            className={cn(
              'max-w-[4.5rem] sm:max-w-none truncate font-medium',
              step.state === 'current' ? 'text-blue-900' : 'text-gray-600',
            )}
            title={step.label}
          >
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span className="mx-0.5 hidden sm:inline text-gray-300" aria-hidden>
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
