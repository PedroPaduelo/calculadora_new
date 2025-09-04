import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, FileText, Upload, Download, Edit, Calculator, Trash2 } from 'lucide-react'
import { usePremises, useDeletePremise } from '@/hooks/use-premises'
import { PlanningPremise } from '@calculadora-hc/shared'
import { ImportDialog } from '@/components/premises/ImportDialog'
import { PremiseForm } from '@/components/premises/PremiseForm'
import { CalculationDialog } from '@/components/premises/CalculationDialog'
import { DeletePremiseDialog } from '@/components/premises/DeletePremiseDialog'
import { ExportDialog } from '@/components/premises/ExportDialog'

export function PremisesPage() {
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCalculationDialog, setShowCalculationDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedPremise, setSelectedPremise] = useState<PlanningPremise | null>(null)

  const { data: premises = [], isLoading, error } = usePremises()
  const deleteMutation = useDeletePremise()

  const handleEdit = (premise: PlanningPremise) => {
    setSelectedPremise(premise)
    setShowEditDialog(true)
  }

  const handleCalculate = (premise: PlanningPremise) => {
    setSelectedPremise(premise)
    setShowCalculationDialog(true)
  }

  const handleDelete = (premise: PlanningPremise) => {
    setSelectedPremise(premise)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (selectedPremise) {
      await deleteMutation.mutateAsync(selectedPremise.id)
      setShowDeleteDialog(false)
      setSelectedPremise(null)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Erro ao carregar premissas</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Premissas de Planejamento</h1>
          <p className="text-muted-foreground">
            Configure curvas de volume, TMI/TMA e improdutividade
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          {premises.length > 0 && (
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Premissa
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && premises.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma premissa encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando uma nova premissa ou importando dados existentes
          </p>
          <div className="flex justify-center space-x-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Dados
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Premissa
            </Button>
          </div>
        </div>
      )}

      {/* Premises Grid */}
      {!isLoading && premises.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {premises.map((premise) => (
            <Card key={premise.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      Mês {premise.plannedMonth}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {premise.unproductivityPercentage}% improd.
                  </Badge>
                </div>
                <CardDescription>
                  Operação: {premise.operationId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Volume</p>
                      <p className="text-muted-foreground">
                        {Array.isArray(premise.volumeCurve) 
                          ? premise.volumeCurve.length 
                          : 0} pontos
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">TMI</p>
                      <p className="text-muted-foreground">
                        {Array.isArray(premise.tmiCurve) 
                          ? premise.tmiCurve.length 
                          : 0} pontos
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">TMA</p>
                      <p className="text-muted-foreground">
                        {Array.isArray(premise.tmaCurve) 
                          ? premise.tmaCurve.length 
                          : 0} pontos
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Criado em</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(premise.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(premise)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCalculate(premise)}
                  >
                    <Calculator className="mr-1 h-3 w-3" />
                    Calcular
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(premise)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ImportDialog 
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

      <PremiseForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <PremiseForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        premise={selectedPremise}
      />

      <CalculationDialog
        open={showCalculationDialog}
        onOpenChange={setShowCalculationDialog}
        premise={selectedPremise}
      />

      <DeletePremiseDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        premise={selectedPremise}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        premises={premises}
      />
    </div>
  )
}
