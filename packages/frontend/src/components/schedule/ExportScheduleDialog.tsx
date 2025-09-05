import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Download, FileText, Table, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const exportSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv']),
  period: z.enum(['today', 'week', 'month']),
  includeCharts: z.boolean(),
  includeSummary: z.boolean(),
  includeRecommendations: z.boolean(),
  includeHourlyBreakdown: z.boolean(),
})

type ExportFormData = z.infer<typeof exportSchema>

interface ExportScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPeriod: string
  scheduleData: {
    summary: {
      totalScheduled: number
      totalNeeded: number
      coverage: number
      gaps: number
      surplus: number
    }
    periods: Array<{
      time: string
      scheduled: number
      needed: number
      coverage: number
      status: string
    }>
    shifts: Array<{
      name: string
      scheduled: number
      needed: number
      coverage: number
    }>
  }
}

export function ExportScheduleDialog({ 
  open, 
  onOpenChange, 
  currentPeriod,
  scheduleData
}: ExportScheduleDialogProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'pdf',
      period: currentPeriod as any,
      includeCharts: true,
      includeSummary: true,
      includeRecommendations: true,
      includeHourlyBreakdown: true,
    }
  })

  const generatePDF = (data: ExportFormData) => {
    // Create a simple HTML content for PDF generation
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório Escala x Necessidade</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .metric { display: inline-block; margin: 10px 15px 10px 0; }
            .recommendations { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            ul { margin: 10px 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <h1>Relatório Escala x Necessidade</h1>
          <p><strong>Período:</strong> ${data.period === 'today' ? 'Hoje' : data.period === 'week' ? 'Semana' : 'Mês'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    `
    
    if (data.includeSummary) {
      htmlContent += `
        <h2>Resumo Executivo</h2>
        <div class="summary">
          <div class="metric"><strong>HC Escalado:</strong> ${scheduleData.summary.totalScheduled}</div>
          <div class="metric"><strong>HC Necessário:</strong> ${scheduleData.summary.totalNeeded}</div>
          <div class="metric"><strong>Cobertura:</strong> ${scheduleData.summary.coverage}%</div>
          <div class="metric"><strong>Gaps:</strong> ${scheduleData.summary.gaps}</div>
          <div class="metric"><strong>Excesso:</strong> ${scheduleData.summary.surplus}</div>
        </div>
      `
    }
    
    if (data.includeHourlyBreakdown) {
      htmlContent += `
        <h2>Análise por Horário</h2>
        <table>
          <thead>
            <tr>
              <th>Horário</th>
              <th>Escalado</th>
              <th>Necessário</th>
              <th>Cobertura</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `
      scheduleData.periods.forEach(period => {
        htmlContent += `
          <tr>
            <td>${period.time}</td>
            <td>${period.scheduled}</td>
            <td>${period.needed}</td>
            <td>${period.coverage}%</td>
            <td>${period.status === 'gap' ? 'Gap' : 'Excesso'}</td>
          </tr>
        `
      })
      htmlContent += `</tbody></table>`
    }
    
    htmlContent += `
      <h2>Análise por Turno</h2>
      <table>
        <thead>
          <tr>
            <th>Turno</th>
            <th>Escalado</th>
            <th>Necessário</th>
            <th>Cobertura</th>
          </tr>
        </thead>
        <tbody>
    `
    scheduleData.shifts.forEach(shift => {
      htmlContent += `
        <tr>
          <td>${shift.name}</td>
          <td>${shift.scheduled}</td>
          <td>${shift.needed}</td>
          <td>${shift.coverage}%</td>
        </tr>
      `
    })
    htmlContent += `</tbody></table>`
    
    if (data.includeRecommendations) {
      htmlContent += `
        <h2>Recomendações</h2>
        <div class="recommendations">
          <ul>
            <li>Períodos de 07:00-09:00 apresentam déficit de HC</li>
            <li>Considere redistribuir escalas ou contratar temporários</li>
            <li>Excesso no período da manhã pode ser redistribuído</li>
            <li>Turnos da tarde e noite apresentam cobertura adequada</li>
          </ul>
        </div>
      `
    }
    
    htmlContent += `</body></html>`
    return htmlContent
  }

  const generateExportContent = (data: ExportFormData) => {
    let content = ''
    
    if (data.format === 'csv') {
      // CSV format
      content = 'RELATÓRIO ESCALA X NECESSIDADE\n\n'
      
      if (data.includeSummary) {
        content += 'RESUMO EXECUTIVO\n'
        content += 'Métrica,Valor\n'
        content += `HC Escalado,${scheduleData.summary.totalScheduled}\n`
        content += `HC Necessário,${scheduleData.summary.totalNeeded}\n`
        content += `Cobertura,${scheduleData.summary.coverage}%\n`
        content += `Gaps,${scheduleData.summary.gaps}\n`
        content += `Excesso,${scheduleData.summary.surplus}\n\n`
      }
      
      if (data.includeHourlyBreakdown) {
        content += 'ANÁLISE POR HORÁRIO\n'
        content += 'Horário,Escalado,Necessário,Cobertura,Status\n'
        scheduleData.periods.forEach(period => {
          content += `${period.time},${period.scheduled},${period.needed},${period.coverage}%,${period.status}\n`
        })
        content += '\n'
      }
      
      content += 'ANÁLISE POR TURNO\n'
      content += 'Turno,Escalado,Necessário,Cobertura\n'
      scheduleData.shifts.forEach(shift => {
        content += `${shift.name},${shift.scheduled},${shift.needed},${shift.coverage}%\n`
      })
      
    } else {
      // Plain text format for Excel
      content = `RELATÓRIO ESCALA X NECESSIDADE\n`
      content += `Período: ${data.period === 'today' ? 'Hoje' : data.period === 'week' ? 'Semana' : 'Mês'}\n`
      content += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`
      
      if (data.includeSummary) {
        content += `RESUMO EXECUTIVO\n`
        content += `================\n`
        content += `HC Escalado: ${scheduleData.summary.totalScheduled}\n`
        content += `HC Necessário: ${scheduleData.summary.totalNeeded}\n`
        content += `Cobertura: ${scheduleData.summary.coverage}%\n`
        content += `Gaps: ${scheduleData.summary.gaps}\n`
        content += `Excesso: ${scheduleData.summary.surplus}\n\n`
      }
      
      if (data.includeHourlyBreakdown) {
        content += `ANÁLISE POR HORÁRIO\n`
        content += `==================\n`
        scheduleData.periods.forEach(period => {
          content += `${period.time}: ${period.scheduled} escalado / ${period.needed} necessário (${period.coverage}% cobertura) - ${period.status}\n`
        })
        content += '\n'
      }
      
      content += `ANÁLISE POR TURNO\n`
      content += `=================\n`
      scheduleData.shifts.forEach(shift => {
        content += `${shift.name}: ${shift.scheduled} escalado / ${shift.needed} necessário (${shift.coverage}% cobertura)\n`
      })
      
      if (data.includeRecommendations) {
        content += `\nRECOMENDAÇÕES\n`
        content += `=============\n`
        content += `• Períodos de 07:00-09:00 apresentam déficit de HC\n`
        content += `• Considere redistribuir escalas ou contratar temporários\n`
        content += `• Excesso no período da manhã pode ser redistribuído\n`
        content += `• Turnos da tarde e noite apresentam cobertura adequada\n`
      }
    }
    
    return content
  }

  const onSubmit = async (data: ExportFormData) => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate filename
      const periodLabel = {
        today: 'Hoje',
        week: 'Semana',
        month: 'Mes'
      }[data.period]
      
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `Escala_vs_Necessidade_${periodLabel}_${timestamp}.${data.format}`
      
      if (data.format === 'pdf') {
        // Generate PDF using HTML content
        const htmlContent = generatePDF(data)
        
        // Create a new window to print as PDF
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          
          // Wait for content to load then trigger print
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
        }
      } else {
        // Generate content for CSV/Excel
        const content = generateExportContent(data)
        
        // Create download with real data
        const element = document.createElement('a')
        const mimeType = data.format === 'csv' ? 'text/csv' : 'text/plain'
        element.href = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content)
        element.download = filename
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      }
      
      toast({
        title: "Relatório Exportado",
        description: `Arquivo ${filename} foi baixado com sucesso.`,
      })
      
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o relatório. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Relatório formatado para impressão' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Planilha editável com dados' },
    { value: 'csv', label: 'CSV', icon: BarChart3, description: 'Dados tabulares para análise' }
  ]

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Semana Atual' },
    { value: 'month', label: 'Mês Atual' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Format Selection */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato do Arquivo</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {formatOptions.map((option) => (
                      <Card 
                        key={option.value}
                        className={`cursor-pointer transition-colors ${
                          field.value === option.value ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => field.onChange(option.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <option.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {option.description}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period Selection */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Options */}
            <div className="space-y-4">
              <FormLabel>Conteúdo do Relatório</FormLabel>
              
              <FormField
                control={form.control}
                name="includeSummary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Resumo Executivo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Métricas principais e indicadores de cobertura
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeHourlyBreakdown"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Análise por Horário</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Detalhamento período a período
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeCharts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Gráficos e Visualizações</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Gráficos de cobertura e tendências
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeRecommendations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recomendações</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Sugestões de otimização e melhorias
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isExporting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isExporting}>
                {isExporting ? (
                  <>Exportando...</>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
