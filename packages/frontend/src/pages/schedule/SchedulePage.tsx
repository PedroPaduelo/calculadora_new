import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AdjustScheduleDialog } from '@/components/schedule/AdjustScheduleDialog'
import { ExportScheduleDialog } from '@/components/schedule/ExportScheduleDialog'
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Target,
  Download,
  Settings
} from 'lucide-react'

export function SchedulePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Mock data - replace with real API calls
  const getScheduleData = (_period: string) => ({
    summary: {
      totalScheduled: 180,
      totalNeeded: 165,
      coverage: 109,
      gaps: 3,
      surplus: 18
    },
    periods: [
      { time: '06:00', scheduled: 25, needed: 20, coverage: 125, status: 'surplus' },
      { time: '07:00', scheduled: 30, needed: 35, coverage: 86, status: 'gap' },
      { time: '08:00', scheduled: 40, needed: 45, coverage: 89, status: 'gap' },
      { time: '09:00', scheduled: 35, needed: 40, coverage: 88, status: 'gap' },
      { time: '10:00', scheduled: 30, needed: 25, coverage: 120, status: 'surplus' },
      { time: '11:00', scheduled: 20, needed: 15, coverage: 133, status: 'surplus' }
    ],
    shifts: [
      { name: 'Madrugada', scheduled: 45, needed: 40, coverage: 113 },
      { name: 'Manhã', scheduled: 65, needed: 70, coverage: 93 },
      { name: 'Tarde', scheduled: 40, needed: 35, coverage: 114 },
      { name: 'Noite', scheduled: 30, needed: 20, coverage: 150 }
    ]
  })

  const scheduleData = getScheduleData(selectedPeriod)

  const handleAdjustSchedule = (adjustments: any[]) => {
    console.log('Adjustments saved:', adjustments)
    // Here you would typically call an API to save the adjustments
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'gap': return 'destructive'
      case 'surplus': return 'secondary'
      default: return 'default'
    }
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage < 90) return 'text-red-600'
    if (coverage > 120) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escala x Necessidade</h1>
          <p className="text-muted-foreground">
            Comparação entre escalas programadas e necessidade calculada
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedPeriod === 'today' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('today')}
          >
            Hoje
          </Button>
          <Button 
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
          >
            Semana
          </Button>
          <Button 
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              HC Escalado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {scheduleData.summary.totalScheduled}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              HC Necessário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {scheduleData.summary.totalNeeded}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Cobertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCoverageColor(scheduleData.summary.coverage)}`}>
              {scheduleData.summary.coverage}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {scheduleData.summary.gaps}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Excesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {scheduleData.summary.surplus}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Análise por Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduleData.periods.map((period, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-medium w-16">{period.time}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(period.status)}>
                        {period.status === 'gap' ? 'Gap' : 'Excesso'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Escalado</div>
                      <div className="font-medium">{period.scheduled}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Necessário</div>
                      <div className="font-medium">{period.needed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Cobertura</div>
                      <div className={`font-bold ${getCoverageColor(period.coverage)}`}>
                        {period.coverage}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shift Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Análise por Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {scheduleData.shifts.map((shift, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{shift.name}</div>
                    <div className={`text-sm font-bold ${getCoverageColor(shift.coverage)}`}>
                      {shift.coverage}%
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Escalado: {shift.scheduled}</span>
                    <span>Necessário: {shift.needed}</span>
                    <span>Diferença: {shift.scheduled - shift.needed > 0 ? '+' : ''}{shift.scheduled - shift.needed}</span>
                  </div>
                  
                  <Progress 
                    value={Math.min(100, shift.coverage)} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Gaps Críticos Identificados</h4>
                <p className="text-sm text-red-700 mt-1">
                  Períodos de 07:00-09:00 apresentam déficit de HC. Considere redistribuir escalas ou contratar temporários.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Otimização de Escalas</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Excesso no período da manhã pode ser redistribuído para cobrir gaps da tarde.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-green-200 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Cobertura Adequada</h4>
                <p className="text-sm text-green-700 mt-1">
                  Turnos da tarde e noite apresentam cobertura adequada com pequenos excedentes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
        <Button onClick={() => setAdjustDialogOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Ajustar Escalas
        </Button>
      </div>

      {/* Dialogs */}
      <AdjustScheduleDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        periods={scheduleData.periods}
        onSave={handleAdjustSchedule}
      />

      <ExportScheduleDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        currentPeriod={selectedPeriod}
        scheduleData={scheduleData}
      />
    </div>
  )
}
