import { z } from 'zod'

export const SolicitacaoItemSchema = z.object({
    id:             z.number(),
    descricao:      z.string(),
    quantidade:     z.number(),
    preco_estimado: z.number(),
})

export const ItemFormSchema = z.object({
    descricao:      z.string().min(1, 'Obrigatório'),
    quantidade:     z.number().min(1, 'Mínimo 1'),
    preco_estimado: z.number().min(0, 'Obrigatório'),
})

export type ItemSchema = z.infer<typeof SolicitacaoItemSchema>
export type ItemForm = z.infer<typeof ItemFormSchema>
