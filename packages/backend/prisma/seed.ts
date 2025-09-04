import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('123456', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@calculadora.com' },
    update: {},
    create: {
      email: 'admin@calculadora.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create manager user
  const managerPassword = await bcrypt.hash('123456', 10)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@calculadora.com' },
    update: {},
    create: {
      email: 'manager@calculadora.com',
      name: 'Gerente',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  // Create analyst user
  const analystPassword = await bcrypt.hash('123456', 10)
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@calculadora.com' },
    update: {},
    create: {
      email: 'analyst@calculadora.com',
      name: 'Analista',
      password: analystPassword,
      role: 'ANALYST',
    },
  })

  // Create sample operations
  const operation1 = await prisma.operation.upsert({
    where: { id: 'op1' },
    update: {},
    create: {
      id: 'op1',
      name: 'Atendimento Geral',
      description: 'Atendimento ao cliente geral - SAC',
      workingHours: {
        start: '06:00',
        end: '22:00',
      },
      slaTarget: 90,
      slaPercentage: 89.2,
    },
  })

  const operation2 = await prisma.operation.upsert({
    where: { id: 'op2' },
    update: {},
    create: {
      id: 'op2',
      name: 'Suporte Técnico',
      description: 'Suporte técnico especializado',
      workingHours: {
        start: '08:00',
        end: '18:00',
      },
      slaTarget: 85,
      slaPercentage: 87.8,
    },
  })

  const operation3 = await prisma.operation.upsert({
    where: { id: 'op3' },
    update: {},
    create: {
      id: 'op3',
      name: 'Vendas',
      description: 'Equipe de vendas ativas',
      workingHours: {
        start: '09:00',
        end: '19:00',
      },
      slaTarget: 95,
      slaPercentage: 93.1,
    },
  })

  // Create sample work shifts
  const shift1 = await prisma.workShift.create({
    data: {
      duration: 'SHIFT_6_20',
      unproductivityRate: 0.135,
      minLoginTime: '06:00',
      maxLoginTime: '22:00',
    },
  })

  const shift2 = await prisma.workShift.create({
    data: {
      duration: 'SHIFT_8_12',
      unproductivityRate: 0.18,
      minLoginTime: '06:00',
      maxLoginTime: '22:00',
    },
  })

  const shift3 = await prisma.workShift.create({
    data: {
      duration: 'SHIFT_4_00',
      unproductivityRate: 0.0871,
      minLoginTime: '06:00',
      maxLoginTime: '22:00',
    },
  })

  // Create sample planning premises with realistic curves
  const volumeCurve = Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4)
    // Peak hours: 9-11, 14-16, 19-21
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) || (hour >= 19 && hour <= 21)) {
      return Math.floor(Math.random() * 50) + 80 // 80-130 calls
    } else if (hour >= 6 && hour <= 22) {
      return Math.floor(Math.random() * 30) + 20 // 20-50 calls
    } else {
      return Math.floor(Math.random() * 10) + 5 // 5-15 calls
    }
  })

  const tmiCurve = Array.from({ length: 96 }, () => 
    Math.floor(Math.random() * 60) + 180 // 180-240 seconds (3-4 minutes)
  )

  const tmaCurve = Array.from({ length: 96 }, () => 
    Math.floor(Math.random() * 30) + 200 // 200-230 seconds
  )

  const premise1 = await prisma.planningPremise.create({
    data: {
      operationId: operation1.id,
      plannedMonth: '2024-02',
      volumeCurve,
      tmiCurve,
      tmaCurve,
      unproductivityPercentage: 18,
    },
  })

  const premise2 = await prisma.planningPremise.create({
    data: {
      operationId: operation2.id,
      plannedMonth: '2024-02',
      volumeCurve: volumeCurve.map(v => Math.floor(v * 0.6)), // 60% of general volume
      tmiCurve: tmiCurve.map(t => t + 60), // Longer handle time for technical support
      tmaCurve: tmaCurve.map(t => t + 60),
      unproductivityPercentage: 15,
    },
  })

  // Create sample scenarios
  const scenario1 = await prisma.scenario.create({
    data: {
      name: 'Cenário Base - Fevereiro 2024',
      description: 'Cenário base com premissas padrão',
      userId: admin.id,
      operationId: operation1.id,
      premisesSnapshot: {
        volumeCurve,
        tmiCurve,
        tmaCurve,
        unproductivityPercentage: 18,
        targetSLA: 90,
      },
      resultsSnapshot: {
        totalHC: 245,
        avgHC: 187.5,
        peakHours: [10, 15, 20],
        avgOccupancy: 78.5,
        maxOccupancy: 92.1,
        slaAchieved: 91.2,
      },
    },
  })

  const scenario2 = await prisma.scenario.create({
    data: {
      name: 'Otimização Turnos - Suporte',
      description: 'Cenário otimizado para suporte técnico',
      userId: manager.id,
      operationId: operation2.id,
      premisesSnapshot: {
        volumeCurve: volumeCurve.map(v => Math.floor(v * 0.6)),
        tmiCurve: tmiCurve.map(t => t + 60),
        tmaCurve: tmaCurve.map(t => t + 60),
        unproductivityPercentage: 15,
        targetSLA: 85,
      },
      resultsSnapshot: {
        totalHC: 89,
        avgHC: 67.3,
        peakHours: [10, 15],
        avgOccupancy: 82.1,
        maxOccupancy: 95.7,
        slaAchieved: 87.8,
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Users created:')
  console.log(`  - Admin: admin@calculadora.com (password: 123456)`)
  console.log(`  - Manager: manager@calculadora.com (password: 123456)`)
  console.log(`  - Analyst: analyst@calculadora.com (password: 123456)`)
  console.log('🏢 Operations created:', operation1.name, operation2.name, operation3.name)
  console.log('📊 Planning premises created:', premise1.id, premise2.id)
  console.log('🎯 Scenarios created:', scenario1.name, scenario2.name)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
