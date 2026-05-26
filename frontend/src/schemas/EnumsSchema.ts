import { z } from 'zod'

export const StatusEnum = z.enum(['pendente', 'aprovada', 'rejeitada'])
export const PrioridadeEnum = z.enum(['baixa', 'media', 'alta'], "Selecione uma prioridade.")

export type Status = z.infer<typeof StatusEnum>
export type Prioridade = z.infer<typeof PrioridadeEnum>
