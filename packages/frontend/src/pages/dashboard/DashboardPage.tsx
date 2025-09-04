import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Clock, TrendingUp, Calculator, Building2 } from 'lucide-react'

export function DashboardPage() {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Operações Ativas',
      value: '12',
      description: 'Operações configuradas',
      icon: Building2,
      trend: '+2 este mês',
    },
    {
      title: 'HC Total Planejado',
      value: '2,847',
      description: 'Recursos necessários',
      icon: Users,
      trend: '+12% vs mês anterior',
    },
    {
      title: 'SLA Médio',
      value: '89.2%',
      description: 'Nível de serviço atual',
      icon: TrendingUp,
      trend: '+2.1% vs meta',
    },
    {
      title: 'Occupancy Média',
      value: '78.5%',
      description: 'Taxa de ocupação',
      icon: BarChart3,
      trend: 'Dentro do target',
    },
  ]

  const recentCalculations = [
    { operation: 'Atendimento Geral', date: '2024-01-15', hc: 245, sla: '91.2%' },
    { operation: 'Suporte Técnico', date: '2024-01-15', hc: 89, sla: '87.8%' },
    { operation: 'Vendas', date: '2024-01-14', hc: 156, sla: '93.1%' },
    { operation: 'Retenção', date: '2024-01-14', hc: 67, sla: '85.9%' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <p className="text-muted-foreground">
          Visão executiva do planejamento de recursos humanos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Cálculos Recentes
            </CardTitle>
            <CardDescription>
              Últimos dimensionamentos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalculations.map((calc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{calc.operation}</p>
                    <p className="text-sm text-muted-foreground">{calc.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{calc.hc} HCs</p>
                    <p className="text-sm text-green-600">SLA: {calc.sla}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <Calculator className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">Novo Cálculo</h3>
                <p className="text-sm text-muted-foreground">Dimensionar HC</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <Building2 className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">Nova Operação</h3>
                <p className="text-sm text-muted-foreground">Cadastrar operação</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <Clock className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">Gerar Escala</h3>
                <p className="text-sm text-muted-foreground">Criar cronograma</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">Relatórios</h3>
                <p className="text-sm text-muted-foreground">Análises e métricas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Período</CardTitle>
          <CardDescription>
            SLA e Occupancy dos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Gráfico de performance será implementado</p>
              <p className="text-sm text-muted-foreground">Integração com Recharts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
