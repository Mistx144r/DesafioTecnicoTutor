import { useState } from 'react'
import { apiFetch } from '../contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog'
import { Loader2, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const rejeitarSchema = z.object({
    justificativa: z.string().min(1, 'Justificativa obrigatória').max(255, 'Máximo 255 caracteres'),
})

type RejeitarForm = z.infer<typeof rejeitarSchema>

interface Item {
    id: number
    descricao: string
    quantidade: number
    preco_estimado: number
}

interface Solicitacao {
    id: number
    titulo: string
    setor: string
    prioridade: string
    status: 'pendente' | 'aprovada' | 'rejeitada'
    justificativa_decisao: string | null
    criado_em: string
    itens: Item[]
}

const statusConfig = {
    pendente:  { label: 'Pendente',  className: 'bg-amber-500/20 text-amber-400' },
    aprovada:  { label: 'Aprovada',  className: 'bg-tutor-accent/20 text-tutor-accent' },
    rejeitada: { label: 'Rejeitada', className: 'bg-red-500/20 text-red-400' },
}

const prioridadeConfig = {
    baixa: 'bg-tutor-secondary/20 text-tutor-accent-soft',
    media: 'bg-amber-500/20 text-amber-400',
    alta:  'bg-red-500/20 text-red-400',
}

interface Props {
    id: number | null
    open: boolean
    onClose: () => void
    onDecisao: () => void
}

export function SolicitacaoDetalhes({ id, open, onClose, onDecisao }: Props) {
    const queryClient = useQueryClient()
    const [decidindo, setDecidindo] = useState(false)
    const [openAprovar, setOpenAprovar] = useState(false)
    const [openRejeitar, setOpenRejeitar] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RejeitarForm>({
        resolver: zodResolver(rejeitarSchema),
    })

    const { data, isLoading } = useQuery({
        queryKey: ['solicitacao', id],
        queryFn: () => {
            const formData = new FormData()
            formData.append('id', String(id))
            return apiFetch('/api/solicitacao/obter', { method: 'POST', body: formData })
        },
        enabled: !!id && open,
        select: (res) => res.ok ? res.dados as Solicitacao : null,
    })

    const solicitacao = data ?? null
    const loading = isLoading

    const decidir = async (acao: 'aprovar' | 'rejeitar', justificativa?: string) => {
        if (!solicitacao) return
        setDecidindo(true)
        const formData = new FormData()
        formData.append('id', String(solicitacao.id))
        formData.append('acao', acao)
        if (justificativa) formData.append('justificativa_decisao', justificativa)

        const res = await apiFetch('/api/solicitacao/decidir', { method: 'POST', body: formData })
        setDecidindo(false)

        if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['solicitacao', id] })
            onDecisao()
            onClose()
        }
    }

    const onRejeitar = handleSubmit((data) => {
        decidir('rejeitar', data.justificativa)
        reset()
    })

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <div
                className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <DialogContent className="bg-tutor-dark-card border-white/10 text-white max-w-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 [&>button]:hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-white font-normal">Detalhes da Solicitação</DialogTitle>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogHeader>

                {loading || !solicitacao ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">

                        <div className="flex flex-col gap-2">
                            <h2 className="text-white text-lg font-semibold">{solicitacao.titulo}</h2>
                            <div className="flex gap-2 flex-wrap">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[solicitacao.status].className}`}>
                                    {statusConfig[solicitacao.status].label}
                                </span>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioridadeConfig[solicitacao.prioridade as keyof typeof prioridadeConfig]}`}>
                                    {solicitacao.prioridade}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <p className="text-white/40 text-xs">Setor</p>
                                    <p className="text-white text-sm">{solicitacao.setor}</p>
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs">Data</p>
                                    <p className="text-white text-sm">{new Date(solicitacao.criado_em).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            {solicitacao.justificativa_decisao && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-1">
                                    <p className="text-red-400 text-xs font-medium mb-1">Justificativa de rejeição</p>
                                    <p className="text-white/70 text-sm">{solicitacao.justificativa_decisao}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Itens</p>
                            <div className="bg-tutor-dark rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-white/40 font-medium text-left px-4 py-2">Descrição</th>
                                        <th className="text-white/40 font-medium text-right px-4 py-2">Qtd.</th>
                                        <th className="text-white/40 font-medium text-right px-4 py-2">Preço Est.</th>
                                        <th className="text-white/40 font-medium text-right px-4 py-2">Subtotal</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {solicitacao.itens.map((item) => (
                                        <tr key={item.id} className="border-b border-white/5 last:border-0">
                                            <td className="text-white px-4 py-2">{item.descricao}</td>
                                            <td className="text-white/50 px-4 py-2 text-right">{item.quantidade}</td>
                                            <td className="text-white/50 px-4 py-2 text-right">
                                                {parseFloat(item.preco_estimado as unknown as string).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="text-white px-4 py-2 text-right">
                                                {(parseFloat(item.quantidade as unknown as string) * parseFloat(item.preco_estimado as unknown as string)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className="border-t border-white/10">
                                        <td colSpan={3} className="text-white/50 px-4 py-2 text-right font-medium">Total estimado</td>
                                        <td className="text-tutor-accent px-4 py-2 text-right font-bold">
                                            {solicitacao.itens
                                                .reduce((acc, item) => acc + parseFloat(item.quantidade as unknown as string) * parseFloat(item.preco_estimado as unknown as string), 0)
                                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {solicitacao.status === 'pendente' && (
                            <div className="flex gap-3 pt-2">
                                <AlertDialog open={openAprovar} onOpenChange={setOpenAprovar}>
                                    <div
                                        className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${openAprovar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        onClick={() => setOpenAprovar(false)}
                                    />
                                    <AlertDialogTrigger>
                                        <Button
                                            onClick={() => setOpenAprovar(true)}
                                            className="flex-1 bg-tutor-accent hover:bg-tutor-accent-light text-tutor-dark font-semibold rounded-lg px-5 py-1"
                                        >
                                            Aprovar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-tutor-dark-card border-white/10 text-white max-w-md [&>button]:hidden">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Aprovar solicitação?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-white/50">
                                                Essa ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex">
                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 w-full rounded-lg p-2">
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => decidir('aprovar')}
                                                disabled={decidindo}
                                                className="bg-tutor-accent hover:bg-tutor-accent-light text-tutor-dark w-full font-semibold rounded-lg p-2"
                                            >
                                                {decidindo ? <Loader2 className="w-4 h-4 animate-spin mr-auto ml-auto" /> : 'Confirmar'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog open={openRejeitar} onOpenChange={setOpenRejeitar}>
                                    <div
                                        className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${openRejeitar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        onClick={() => setOpenRejeitar(false)}
                                    />
                                    <AlertDialogTrigger>
                                        <Button
                                            onClick={() => setOpenRejeitar(true)}
                                            variant="ghost"
                                            className="flex-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg px-5 py-1"
                                        >
                                            Rejeitar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-tutor-dark-card border-white/10 text-white max-w-md [&>button]:hidden">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Rejeitar solicitação?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-white/50">
                                                Informe o motivo da rejeição.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <textarea
                                            {...register('justificativa')}
                                            placeholder="Justificativa obrigatória..."
                                            className="w-full bg-tutor-dark border border-white/10 rounded-lg p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-tutor-accent resize-none h-24"
                                        />
                                        {errors.justificativa && (
                                            <span className="text-red-400 text-xs">{errors.justificativa.message}</span>
                                        )}
                                        <AlertDialogFooter className="flex">
                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 rounded-lg px-5 py-1">
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={onRejeitar}
                                                disabled={decidindo}
                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold w-full rounded-lg px-5 py-1"
                                            >
                                                {decidindo ? <Loader2 className="w-4 h-4 animate-spin mr-auto ml-auto" /> : 'Rejeitar'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}