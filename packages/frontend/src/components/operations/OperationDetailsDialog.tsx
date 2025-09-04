import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Operation } from '@calculadora-hc/shared'
import { Building2, Clock, Target, TrendingUp } from 'lucide-react'

interface OperationDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operation: Operation | null
}

export function OperationDetailsDialog({
  open,
  onOpenChange,
  operation,
}: OperationDetailsDialogProps) {
  if (!operation) return null

  const workingHours = typeof operation.workingHours === 'string' 
    ? JSON.parse(operation.workingHours)
    : operation.workingHours

  const slaStatus = operation.slaPercentage >= operation.slaTarget ? 'success' : 'warning'
  const slaColor = slaStatus === 'success' ? 'text-green-600' : 'text-red-600'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <DialogTitle>{operation.name}</DialogTitle>
          </div>
          <DialogDescription>
            Detalhes completos da operação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Descrição */}
          {operation.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground">
                {operation.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Horário de Funcionamento */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Horário de Funcionamento</span>
            </div>
            <Badge variant="outline">
              {workingHours.start} às {workingHours.end}
            </Badge>
          </div>

          {/* SLA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Meta SLA</p>
                <p className="text-lg font-bold">{operation.slaTarget}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">SLA Atual</p>
                <p className={`text-lg font-bold ${slaColor}`}>
                  {operation.slaPercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Status do SLA */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span className="text-sm font-medium">Status do SLA</span>
            <Badge variant={slaStatus === 'success' ? 'default' : 'destructive'}>
              {slaStatus === 'success' ? 'Dentro da Meta' : 'Abaixo da Meta'}
            </Badge>
          </div>

          <Separator />

          {/* Informações de Data */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Criado em</p>
              <p>{new Date(operation.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Atualizado em</p>
              <p>{new Date(operation.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
