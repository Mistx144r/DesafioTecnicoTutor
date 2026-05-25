import { useState } from 'react'
import { apiFetch } from '../contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '../../components/ui/alert-dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from '../../components/ui/table'
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
        setOpenRejeitar(false)
        reset()
    })

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <div
                className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <DialogContent className="bg-tutor-dark-card border-white/10 text-white flex flex-col w-full md:max-w-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 overflow-hidden [&>button]:hidden">
                <DialogHeader className="w-full min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle className="text-white font-normal truncate min-w-0">Detalhes da Solicitação</DialogTitle>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors shrink-0">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogHeader>

                {loading || !solicitacao ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-5 w-full min-w-0">

                        {/* Cabeçalho da solicitação */}
                        <div className="flex flex-col gap-2 w-full min-w-0">
                            <h2 className="text-white text-lg font-semibold truncate w-full min-w-0">{solicitacao.titulo}</h2>
                            <div className="flex gap-2 flex-wrap">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[solicitacao.status].className}`}>
                                    {statusConfig[solicitacao.status].label}
                                </span>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioridadeConfig[solicitacao.prioridade as keyof typeof prioridadeConfig]}`}>
                                    {solicitacao.prioridade}
                                </span>
                            </div>
                            <div className="flex justify-between mt-1">
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

                        {/* Tabela desktop */}
                        <div className="hidden md:block w-full min-w-0 rounded-lg overflow-hidden bg-tutor-dark">
                            <Table className="w-full table-fixed">
                                <TableHeader>
                                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                                        <TableHead className="text-white/40 font-medium text-left px-4 py-2">
                                            Descrição
                                        </TableHead>
                                        <TableHead className="text-white/40 font-medium text-right px-4 py-2 w-16">
                                            Qtd.
                                        </TableHead>
                                        <TableHead className="text-white/40 font-medium text-right px-4 py-2 w-32">
                                            Preço Est.
                                        </TableHead>
                                        <TableHead className="text-white/40 font-medium text-right px-4 py-2 w-36">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                            </Table>

                            <div className="max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                                <Table className="w-full table-fixed">
                                    <TableBody>
                                        {solicitacao.itens.map((item) => (
                                            <TableRow key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                                <TableCell className="px-4 py-2 max-w-0">
                                                    <div className="text-white truncate">{item.descricao}</div>
                                                </TableCell>
                                                <TableCell className="text-white/50 px-4 py-2 text-right whitespace-nowrap w-16">
                                                    {item.quantidade}
                                                </TableCell>
                                                <TableCell className="text-white/50 px-4 py-2 text-right whitespace-nowrap w-32">
                                                    {parseFloat(item.preco_estimado as unknown as string).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-white px-4 py-2 text-right whitespace-nowrap w-36">
                                                    {(
                                                        parseFloat(item.quantidade as unknown as string) *
                                                        parseFloat(item.preco_estimado as unknown as string)
                                                    ).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <Table className="w-full table-fixed">
                                <TableFooter>
                                    <TableRow className="border-t border-white/10 hover:bg-transparent">
                                        <TableCell colSpan={3} className="text-white/50 px-4 py-2 text-right font-medium">
                                            Total estimado
                                        </TableCell>
                                        <TableCell className="text-tutor-accent px-4 py-2 text-right font-bold whitespace-nowrap w-36">
                                            {solicitacao.itens
                                                .reduce(
                                                    (acc, item) =>
                                                        acc +
                                                        parseFloat(item.quantidade as unknown as string) *
                                                        parseFloat(item.preco_estimado as unknown as string),
                                                    0
                                                )
                                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>

                        {/* Cards mobile */}
                        <div className="md:hidden flex flex-col gap-3 w-full min-w-0 max-h-64 overflow-y-auto">
                            {solicitacao.itens.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/5 rounded-lg p-3 flex flex-col gap-2 w-full min-w-0"
                                >
                                    <div className="flex gap-3 w-full min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-white text-sm truncate block">{item.descricao}</span>
                                        </div>
                                        <div className="shrink-0">
                                            <span className="text-white/50 text-sm whitespace-nowrap">x{item.quantidade}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm w-full">
                                        <span className="text-white/50">Preço</span>
                                        <span className="text-white whitespace-nowrap">
                                            {parseFloat(item.preco_estimado as unknown as string).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm font-medium w-full">
                                        <span className="text-white/50">Subtotal</span>
                                        <span className="text-tutor-accent whitespace-nowrap">
                                            {(
                                                parseFloat(item.quantidade as unknown as string) *
                                                parseFloat(item.preco_estimado as unknown as string)
                                            ).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 md:hidden">
                            <h4 className="font-bold">Total Estimado: </h4>
                            <span className="text-tutor-accent">
                                {solicitacao.itens
                                    .reduce(
                                        (acc, item) =>
                                            acc +
                                            parseFloat(item.quantidade as unknown as string) *
                                            parseFloat(item.preco_estimado as unknown as string),
                                        0
                                    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>

                        {solicitacao.status === 'pendente' && (
                            <div className="flex gap-3 pt-2 w-full">
                                <AlertDialog open={openAprovar} onOpenChange={setOpenAprovar}>
                                    <div
                                        className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${openAprovar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        onClick={() => setOpenAprovar(false)}
                                    />
                                    <AlertDialogTrigger className="flex-1">
                                        <Button
                                            onClick={() => setOpenAprovar(true)}
                                            className="w-full bg-tutor-accent hover:bg-tutor-accent-light text-tutor-dark font-semibold rounded-lg px-5 py-1"
                                        >
                                            Aprovar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-tutor-dark-card border-white/10 text-white w-full max-w-md [&>button]:hidden">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Aprovar solicitação?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-white/50">
                                                Essa ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex flex-col w-full">
                                            <AlertDialogAction
                                                onClick={() => {
                                                    decidir('aprovar')
                                                    setOpenAprovar(false)
                                                }}
                                                disabled={decidindo}
                                                className="bg-tutor-accent hover:bg-tutor-accent-light text-tutor-dark w-full font-semibold rounded-lg p-2"
                                            >
                                                {decidindo ? <Loader2 className="w-4 h-4 animate-spin mr-auto ml-auto" /> : 'Confirmar'}
                                            </AlertDialogAction>
                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 w-full rounded-lg p-2">
                                                Cancelar
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog open={openRejeitar} onOpenChange={setOpenRejeitar}>
                                    <div
                                        className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${openRejeitar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        onClick={() => setOpenRejeitar(false)}
                                    />
                                    <AlertDialogTrigger className="flex-1">
                                        <Button
                                            onClick={() => setOpenRejeitar(true)}
                                            variant="ghost"
                                            className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg px-5 py-1"
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
                                        <AlertDialogFooter className="flex flex-col">
                                            <AlertDialogAction
                                                onClick={onRejeitar}
                                                disabled={decidindo}
                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold w-full rounded-lg px-5 py-1"
                                            >
                                                {decidindo ? <Loader2 className="w-4 h-4 animate-spin mr-auto ml-auto" /> : 'Rejeitar'}
                                            </AlertDialogAction>
                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 w-full rounded-lg px-5 py-1">
                                                Cancelar
                                            </AlertDialogCancel>
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