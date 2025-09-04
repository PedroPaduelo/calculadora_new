import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Layers, Copy, GitCompare, Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useScenarios, useCopyScenario } from '@/hooks/use-scenarios'
import { ScenarioForm } from '@/components/scenarios/ScenarioForm'
import { ScenarioDetailsDialog } from '@/components/scenarios/ScenarioDetailsDialog'
import { CompareDialog } from '@/components/scenarios/CompareDialog'
import { DeleteScenarioDialog } from '@/components/scenarios/DeleteScenarioDialog'
import { Scenario } from '@/services/scenarios'

export function ScenariosPage() {
  const { data: scenarios = [], isLoading } = useScenarios()
  const copyMutation = useCopyScenario()
  
  const [showForm, setShowForm] = useState(false)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [viewingScenario, setViewingScenario] = useState<Scenario | null>(null)
  const [deletingScenario, setDeletingScenario] = useState<Scenario | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])

  const handleCopyScenario = async (scenario: Scenario) => {
    try {
      await copyMutation.mutateAsync({
        sourceId: scenario.id,
        name: `${scenario.name} - Cópia`,
        description: scenario.description ? `${scenario.description} (Cópia)` : undefined,
      })
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const getMetrics = (scenario: Scenario) => {
    try {
      const results = typeof scenario.resultsSnapshot === 'string' 
        ? JSON.parse(scenario.resultsSnapshot)
        : scenario.resultsSnapshot
      
      return {
        totalHC: results?.metrics?.totalHC || 0,
        avgOccupancy: results?.metrics?.avgOccupancy || 0,
      }
    } catch {
      return {
        totalHC: 0,
        avgOccupancy: 0,
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cenários</h1>
          <p className="text-muted-foreground">
            Gerencie e compare diferentes cenários de planejamento
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowCompare(true)}
            disabled={scenarios.length < 2}
          >
            <GitCompare className="mr-2 h-4 w-4" />
            Comparar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cenário
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : scenarios.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cenário encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro cenário para começar a comparar diferentes estratégias de dimensionamento.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Cenário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const metrics = getMetrics(scenario)
            
            return (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyScenario(scenario)}
                        disabled={copyMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingScenario(scenario)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingScenario(scenario)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingScenario(scenario)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription>
                    {scenario.operation?.name} • {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Total HC</p>
                      <p className="text-2xl font-bold text-primary">{metrics.totalHC}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ocupação Média</p>
                      <p className="text-2xl font-bold text-green-600">{Math.round(metrics.avgOccupancy)}%</p>
                    </div>
                  </div>
                  
                  {scenario.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {scenario.description}
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setViewingScenario(scenario)}
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingScenario(scenario)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <ScenarioForm
        open={showForm || !!editingScenario}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingScenario(null)
          }
        }}
        scenario={editingScenario}
      />

      <ScenarioDetailsDialog
        open={!!viewingScenario}
        onOpenChange={(open) => !open && setViewingScenario(null)}
        scenario={viewingScenario}
      />

      <CompareDialog
        open={showCompare}
        onOpenChange={setShowCompare}
        selectedScenarios={selectedForComparison}
        onScenariosChange={setSelectedForComparison}
      />

      <DeleteScenarioDialog
        open={!!deletingScenario}
        onOpenChange={(open) => !open && setDeletingScenario(null)}
        scenario={deletingScenario}
      />
    </div>
  )
}
