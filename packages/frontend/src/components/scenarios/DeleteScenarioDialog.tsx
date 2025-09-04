import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Scenario } from '@/services/scenarios'
import { useDeleteScenario } from '@/hooks/use-scenarios'

interface DeleteScenarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenario: Scenario | null
}

export function DeleteScenarioDialog({ open, onOpenChange, scenario }: DeleteScenarioDialogProps) {
  const deleteMutation = useDeleteScenario()

  const handleDelete = async () => {
    if (!scenario) return

    try {
      await deleteMutation.mutateAsync(scenario.id)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  if (!scenario) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir Cenário
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O cenário será permanentemente removido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">{scenario.name}</p>
            <p className="text-sm text-muted-foreground">
              {scenario.operation?.name} • {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
            </p>
            {scenario.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {scenario.description}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
