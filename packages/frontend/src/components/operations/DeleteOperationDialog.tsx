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
import { Operation } from '@calculadora-hc/shared'

interface DeleteOperationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operation: Operation | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteOperationDialog({
  open,
  onOpenChange,
  operation,
  onConfirm,
  isLoading = false,
}: DeleteOperationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Operação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a operação "{operation?.name}"?
            <br />
            <br />
            Esta ação não pode ser desfeita e todos os dados relacionados a esta operação
            (premissas, cenários, escalas) também serão removidos.
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
