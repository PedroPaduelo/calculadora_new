import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.scenario.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.resourceAllocation.deleteMany()
  await prisma.planningPremise.deleteMany()
  await prisma.operation.deleteMany()
  await prisma.workShift.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Dados existentes removidos')

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@calculadora.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@calculadora.com',
      name: 'Gerente',
      password: hashedPassword,
      role: 'MANAGER',
    },
  })

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@calculadora.com',
      name: 'Analista',
      password: hashedPassword,
      role: 'ANALYST',
    },
  })

  console.log('👥 Usuários criados')

  // Criar turnos de trabalho
  const shifts = await Promise.all([
    prisma.workShift.create({
      data: {
        duration: 'SHIFT_6_20',
        unproductivityRate: 0.135,
        minLoginTime: '06:00',
        maxLoginTime: '22:00',
      },
    }),
    prisma.workShift.create({
      data: {
        duration: 'SHIFT_8_12',
        unproductivityRate: 0.18,
        minLoginTime: '06:00',
        maxLoginTime: '22:00',
      },
    }),
    prisma.workShift.create({
      data: {
        duration: 'SHIFT_4_00',
        unproductivityRate: 0.0871,
        minLoginTime: '06:00',
        maxLoginTime: '22:00',
      },
    }),
  ])

  console.log('⏰ Turnos de trabalho criados')

  // Criar operações
  const operation1 = await prisma.operation.create({
    data: {
      name: 'Atendimento Geral',
      description: 'Operação de atendimento ao cliente geral',
      workingHours: JSON.stringify({
        monday: { start: '08:00', end: '18:00' },
        tuesday: { start: '08:00', end: '18:00' },
        wednesday: { start: '08:00', end: '18:00' },
        thursday: { start: '08:00', end: '18:00' },
        friday: { start: '08:00', end: '18:00' },
        saturday: { start: '08:00', end: '14:00' },
        sunday: { start: '08:00', end: '14:00' },
      }),
      slaTarget: 80.0,
      slaPercentage: 85.0,
    },
  })

  const operation2 = await prisma.operation.create({
    data: {
      name: 'Suporte Técnico',
      description: 'Operação de suporte técnico especializado',
      workingHours: JSON.stringify({
        monday: { start: '07:00', end: '19:00' },
        tuesday: { start: '07:00', end: '19:00' },
        wednesday: { start: '07:00', end: '19:00' },
        thursday: { start: '07:00', end: '19:00' },
        friday: { start: '07:00', end: '19:00' },
        saturday: { start: '08:00', end: '16:00' },
        sunday: { start: '08:00', end: '16:00' },
      }),
      slaTarget: 75.0,
      slaPercentage: 82.0,
    },
  })

  console.log('🏢 Operações criadas')

  // Criar premissas de planejamento
  const volumeCurve = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    volume: Math.floor(Math.random() * 100) + 50,
  }))

  const tmiCurve = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    tmi: Math.floor(Math.random() * 60) + 180,
  }))

  const tmaCurve = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    tma: Math.floor(Math.random() * 30) + 240,
  }))

  await prisma.planningPremise.create({
    data: {
      operationId: operation1.id,
      plannedMonth: '2024-12',
      volumeCurve: JSON.stringify(volumeCurve),
      tmiCurve: JSON.stringify(tmiCurve),
      tmaCurve: JSON.stringify(tmaCurve),
      unproductivityPercentage: 15.0,
    },
  })

  await prisma.planningPremise.create({
    data: {
      operationId: operation2.id,
      plannedMonth: '2024-12',
      volumeCurve: JSON.stringify(volumeCurve),
      tmiCurve: JSON.stringify(tmiCurve),
      tmaCurve: JSON.stringify(tmaCurve),
      unproductivityPercentage: 18.0,
    },
  })

  console.log('📊 Premissas de planejamento criadas')

  // Criar cenário exemplo
  await prisma.scenario.create({
    data: {
      name: 'Cenário Base - Dezembro 2024',
      description: 'Cenário base para planejamento de dezembro',
      userId: admin.id,
      operationId: operation1.id,
      premisesSnapshot: JSON.stringify({
        volumeCurve,
        tmiCurve,
        tmaCurve,
        unproductivityPercentage: 15.0,
      }),
      resultsSnapshot: JSON.stringify({
        totalHC: 45,
        occupancy: 0.75,
        slaAchievement: 0.85,
        efficiency: 0.82,
      }),
    },
  })

  console.log('🎯 Cenário exemplo criado')

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📋 Usuários criados:')
  console.log('- admin@calculadora.com (senha: 123456)')
  console.log('- manager@calculadora.com (senha: 123456)')
  console.log('- analyst@calculadora.com (senha: 123456)')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
