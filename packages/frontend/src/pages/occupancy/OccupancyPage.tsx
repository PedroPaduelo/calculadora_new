import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Activity,
  Zap
} from 'lucide-react'

export function OccupancyPage() {
  const [selectedOperation, setSelectedOperation] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  // Mock data - replace with real API calls
  const occupancyData = {
    summary: {
      avgOccupancy: 73.5,
      peakOccupancy: 95.2,
      minOccupancy: 42.8,
      targetOccupancy: 75,
      periodsAboveTarget: 12,
      periodsBelowTarget: 8,
      optimalPeriods: 28
    },
    hourlyData: [
      { time: '06:00', occupancy: 45.2, agents: 15, calls: 120, status: 'low' },
      { time: '07:00', occupancy: 68.5, agents: 20, calls: 280, status: 'optimal' },
      { time: '08:00', occupancy: 82.3, agents: 25, calls: 420, status: 'optimal' },
      { time: '09:00', occupancy: 95.2, agents: 30, calls: 580, status: 'high' },
      { time: '10:00', occupancy: 88.7, agents: 28, calls: 510, status: 'optimal' },
      { time: '11:00', occupancy: 76.4, agents: 25, calls: 390, status: 'optimal' },
      { time: '12:00', occupancy: 71.2, agents: 22, calls: 320, status: 'optimal' },
      { time: '13:00', occupancy: 79.8, agents: 24, calls: 410, status: 'optimal' },
      { time: '14:00', occupancy: 85.6, agents: 26, calls: 480, status: 'optimal' },
      { time: '15:00', occupancy: 92.1, agents: 28, calls: 550, status: 'high' },
      { time: '16:00', occupancy: 87.3, agents: 27, calls: 495, status: 'optimal' },
      { time: '17:00', occupancy: 74.9, agents: 23, calls: 365, status: 'optimal' }
    ],
    trends: {
      weeklyChange: 2.3,
      monthlyChange: -1.8,
      efficiency: 89.2,
      slaImpact: 4.5
    },
    alerts: [
      { type: 'warning', message: 'Ocupação acima de 90% detectada às 09:00 e 15:00', priority: 'high' },
      { type: 'info', message: 'Período de baixa ocupação (06:00-07:00) pode ser otimizado', priority: 'medium' },
      { type: 'success', message: 'Meta de ocupação atingida em 70% dos períodos', priority: 'low' }
    ]
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy < 50) return 'text-blue-600'
    if (occupancy < 70) return 'text-yellow-600'
    if (occupancy < 85) return 'text-green-600'
    return 'text-red-600'
  }

  const getOccupancyBadge = (status: string) => {
    switch (status) {
      case 'low': return 'secondary'
      case 'optimal': return 'default'
      case 'high': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'low': return 'Baixa'
      case 'optimal': return 'Ótima'
      case 'high': return 'Alta'
      default: return 'Normal'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análise de Ocupação</h1>
          <p className="text-muted-foreground">
            Monitoramento e análise da taxa de ocupação dos agentes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedOperation} onValueChange={setSelectedOperation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar operação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Operações</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="cobranca">Cobrança</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ocupação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getOccupancyColor(occupancyData.summary.avgOccupancy)}`}>
              {occupancyData.summary.avgOccupancy}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3" />
              +{occupancyData.trends.weeklyChange}% vs semana anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pico Máximo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getOccupancyColor(occupancyData.summary.peakOccupancy)}`}>
              {occupancyData.summary.peakOccupancy}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Registrado às 09:00
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Meta de Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {occupancyData.summary.targetOccupancy}%
            </div>
            <Progress 
              value={(occupancyData.summary.avgOccupancy / occupancyData.summary.targetOccupancy) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {occupancyData.trends.efficiency}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Produtividade geral
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Occupancy Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ocupação por Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {occupancyData.hourlyData.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-medium w-16">{hour.time}</div>
                    <Badge variant={getOccupancyBadge(hour.status)}>
                      {getStatusLabel(hour.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Ocupação</div>
                      <div className={`font-bold ${getOccupancyColor(hour.occupancy)}`}>
                        {hour.occupancy}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Agentes</div>
                      <div className="font-medium">{hour.agents}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Chamadas</div>
                      <div className="font-medium">{hour.calls}</div>
                    </div>
                    <div className="w-24">
                      <Progress value={hour.occupancy} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Trends */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Períodos Ótimos</span>
                <span className="font-bold text-green-600">{occupancyData.summary.optimalPeriods}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Acima da Meta</span>
                <span className="font-bold text-yellow-600">{occupancyData.summary.periodsAboveTarget}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Abaixo da Meta</span>
                <span className="font-bold text-blue-600">{occupancyData.summary.periodsBelowTarget}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Impacto no SLA</span>
                <span className="font-bold text-red-600">+{occupancyData.trends.slaImpact}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alertas e Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {occupancyData.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tendências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Variação Semanal</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">+{occupancyData.trends.weeklyChange}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Variação Mensal</span>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-600 font-medium">{occupancyData.trends.monthlyChange}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          Exportar Dados
        </Button>
        <Button>
          Configurar Alertas
        </Button>
      </div>
    </div>
  )
}
