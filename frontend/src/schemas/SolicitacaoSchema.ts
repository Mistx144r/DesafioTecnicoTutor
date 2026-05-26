import { z } from 'zod'
import { StatusEnum, PrioridadeEnum } from './EnumsSchema.ts'
import { SolicitacaoItemSchema, ItemFormSchema } from './SolicitacaoItemSchema.ts'

export const SolicitacaoSchema = z.object({
    id:                    z.number(),
    titulo:                z.string(),
    setor:                 z.string(),
    prioridade:            PrioridadeEnum,
    status:                StatusEnum,
    justificativa_decisao: z.string().nullable(),
    criado_em:             z.string(),
    itens:                 z.array(SolicitacaoItemSchema),
})

export const SolicitacaoFormSchema = z.object({
    titulo:     z.string().min(1, 'Obrigatório').max(120, 'Máximo 120 caracteres'),
    setor:      z.string().min(1, 'Obrigatório').max(60, 'Máximo 60 caracteres'),
    prioridade: PrioridadeEnum,
    itens:      z.array(ItemFormSchema).min(1, 'Adicione ao menos um item'),
})

export const RejeitarSchema = z.object({
    justificativa: z.string().min(1, 'Justificativa obrigatória').max(255, 'Máximo 255 caracteres'),
})

export type SolicitacaoSchema = z.infer<typeof SolicitacaoSchema>
export type SolicitacaoForm = z.infer<typeof SolicitacaoFormSchema>
export type RejeitarForm = z.infer<typeof RejeitarSchema>
