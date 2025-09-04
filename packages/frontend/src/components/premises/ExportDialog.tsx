import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/input'
import { Download, FileText, Table } from 'lucide-react'
import { useExportPremises } from '@/hooks/use-premises'
import { PlanningPremise } from '@calculadora-hc/shared'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  premises: PlanningPremise[]
}

export function ExportDialog({ open, onOpenChange, premises }: ExportDialogProps) {
  const [selectedPremises, setSelectedPremises] = useState<string[]>([])
  const [format, setFormat] = useState<'csv' | 'excel'>('excel')
  const [includeCalculations, setIncludeCalculations] = useState(false)
  
  const exportMutation = useExportPremises()

  const handlePremiseToggle = (premiseId: string) => {
    setSelectedPremises(prev => 
      prev.includes(premiseId)
        ? prev.filter(id => id !== premiseId)
        : [...prev, premiseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPremises.length === premises.length) {
      setSelectedPremises([])
    } else {
      setSelectedPremises(premises.map(p => p.id))
    }
  }

  const handleExport = async () => {
    if (selectedPremises.length === 0) return

    try {
      await exportMutation.mutateAsync({
        premiseIds: selectedPremises,
        format,
        includeCalculations,
      })
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const handleCancel = () => {
    setSelectedPremises([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Premissas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as 'excel')}
                  className="w-4 h-4"
                />
                <Table className="h-4 w-4" />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'csv')}
                  className="w-4 h-4"
                />
                <FileText className="h-4 w-4" />
                <span>CSV</span>
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Opções</Label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCalculations}
                onChange={(e) => setIncludeCalculations(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Incluir resultados de cálculos</span>
            </label>
          </div>

          {/* Premise Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Premissas para Exportar</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedPremises.length === premises.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </Button>
            </div>

            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {premises.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhuma premissa disponível
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {premises.map((premise) => (
                    <label
                      key={premise.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPremises.includes(premise.id)}
                        onChange={() => handlePremiseToggle(premise.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{premise.plannedMonth}</div>
                        <div className="text-sm text-muted-foreground">
                          Improdutividade: {premise.unproductivityPercentage}%
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedPremises.length > 0 && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>{selectedPremises.length}</strong> premissa(s) selecionada(s) para exportação
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            disabled={selectedPremises.length === 0 || exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
