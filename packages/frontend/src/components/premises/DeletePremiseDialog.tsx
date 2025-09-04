import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PlanningPremise } from '@calculadora-hc/shared'

interface DeletePremiseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  premise: PlanningPremise | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeletePremiseDialog({
  open,
  onOpenChange,
  premise,
  onConfirm,
  isLoading = false,
}: DeletePremiseDialogProps) {
  if (!premise) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a premissa do mês <strong>{premise.plannedMonth}</strong>?
            <br />
            Esta ação não pode ser desfeita e todos os cálculos relacionados serão perdidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
