import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Building2, Edit, Trash2, Eye, AlertCircle } from 'lucide-react'
import { useOperations, useCreateOperation, useUpdateOperation, useDeleteOperation } from '@/hooks/use-operations'
import { OperationForm } from '@/components/operations/OperationForm'
import { DeleteOperationDialog } from '@/components/operations/DeleteOperationDialog'
import { OperationDetailsDialog } from '@/components/operations/OperationDetailsDialog'
import { Operation } from '@calculadora-hc/shared'
import { CreateOperationRequest } from '@/services/operations'

export function OperationsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { data: operations, isLoading, error } = useOperations()
  const createMutation = useCreateOperation()
  const updateMutation = useUpdateOperation()
  const deleteMutation = useDeleteOperation()

  const handleCreateOperation = () => {
    setSelectedOperation(null)
    setIsEditing(false)
    setFormOpen(true)
  }

  const handleEditOperation = (operation: Operation) => {
    setSelectedOperation(operation)
    setIsEditing(true)
    setFormOpen(true)
  }

  const handleDeleteOperation = (operation: Operation) => {
    setSelectedOperation(operation)
    setDeleteDialogOpen(true)
  }

  const handleViewDetails = (operation: Operation) => {
    setSelectedOperation(operation)
    setDetailsDialogOpen(true)
  }

  const handleFormSubmit = (data: CreateOperationRequest) => {
    if (isEditing && selectedOperation) {
      updateMutation.mutate(
        { id: selectedOperation.id, data },
        {
          onSuccess: () => {
            setFormOpen(false)
            setSelectedOperation(null)
            setIsEditing(false)
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setFormOpen(false)
        },
      })
    }
  }

  const handleConfirmDelete = () => {
    if (selectedOperation) {
      deleteMutation.mutate(selectedOperation.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setSelectedOperation(null)
        },
      })
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Operações</h1>
            <p className="text-muted-foreground">
              Gerencie as operações do contact center
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar operações</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar a lista de operações.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Operações</h1>
          <p className="text-muted-foreground">
            Gerencie as operações do contact center
          </p>
        </div>
        <Button onClick={handleCreateOperation}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Operação
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : operations && operations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map((operation) => {
            const workingHours = typeof operation.workingHours === 'string' 
              ? JSON.parse(operation.workingHours)
              : operation.workingHours

            return (
              <Card key={operation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{operation.name}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(operation)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditOperation(operation)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteOperation(operation)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{operation.description || 'Sem descrição'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Horário de Funcionamento</p>
                      <Badge variant="outline">
                        {workingHours.start} às {workingHours.end}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Meta SLA</p>
                        <p className="text-sm text-muted-foreground">
                          {operation.slaTarget}%
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">SLA Atual</p>
                        <p className={`text-sm font-medium ${
                          operation.slaPercentage >= operation.slaTarget 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {operation.slaPercentage}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Badge 
                        variant={operation.slaPercentage >= operation.slaTarget ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {operation.slaPercentage >= operation.slaTarget ? 'Dentro da Meta' : 'Abaixo da Meta'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma operação encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira operação.
            </p>
            <Button onClick={handleCreateOperation}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Operação
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <OperationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        operation={selectedOperation}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteOperationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        operation={selectedOperation}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <OperationDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        operation={selectedOperation}
      />
    </div>
  )
}
