import Header from "../components/Header.tsx"
import { useState } from 'react'
import { apiFetch } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SolicitacaoDetalhesModal } from '../components/SolicitacaoDetalhesModal.tsx'
import SolicitacaoCriarModal from '../components/SolicitacaoCriarModal.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table'

interface Resumo {
    status: string
    total: number
}

interface Solicitacao {
    id: number
    titulo: string
    setor: string
    status: 'pendente' | 'aprovada' | 'rejeitada'
    criado_em: string
}

const statusConfig = {
    pendente:  { label: 'Pendente',  className: 'bg-amber-500/20 text-amber-400' },
    aprovada:  { label: 'Aprovada',  className: 'bg-tutor-accent/20 text-tutor-accent' },
    rejeitada: { label: 'Rejeitada', className: 'bg-red-500/20 text-red-400' },
}

const kpiConfig = [
    { key: 'total',     label: 'Total',      icon: ShoppingCart, className: 'text-white' },
    { key: 'pendente',  label: 'Pendentes',  icon: Clock,        className: 'text-amber-400' },
    { key: 'aprovada',  label: 'Aprovadas',  icon: CheckCircle,  className: 'text-tutor-accent' },
    { key: 'rejeitada', label: 'Rejeitadas', icon: XCircle,      className: 'text-red-400' },
]

function DashboardPage() {
    const navigate = useNavigate()
    const [modalId, setModalId] = useState<number | null>(null)
    const [modalCriar, setModalCriar] = useState(false)

    const { data: resumoData, isLoading: resumoLoading, refetch: refetchResumo } = useQuery({
        queryKey: ['resumo'],
        queryFn: () => apiFetch('/api/solicitacao/resumo', { method: 'POST' }),
    })

    const { data: listarData, isLoading: listarLoading, refetch: refetchListar } = useQuery({
        queryKey: ['solicitacoes-recentes'],
        queryFn: () => {
            const f = new FormData()
            f.append('pagina', '1')
            return apiFetch('/api/solicitacao/listar', { method: 'POST', body: f })
        },
    })

    const resumo: Record<string, number> = {}
    if (resumoData?.ok) {
        resumo['total'] = 0
        resumoData.dados.forEach((r: Resumo) => {
            resumo[r.status] = r.total
            resumo['total'] = (resumo['total'] || 0) + Number(r.total)
        })
    }

    const recentes: Solicitacao[] = listarData?.ok
        ? listarData.dados.solicitacoes.slice(0, 5)
        : []

    const loading = resumoLoading || listarLoading

    const refetch = () => {
        refetchResumo()
        refetchListar()
    }

    return (
        <div className="flex flex-col w-screen h-screen bg-tutor-dark">
            <Header />

            <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiConfig.map(({ key, label, icon: Icon, className }) => (
                        <div key={key} className="bg-tutor-dark-card border border-white/10 rounded-lg p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-white/50 text-sm">{label}</span>
                                <Icon className={`w-5 h-5 ${className}`} />
                            </div>
                            {loading
                                ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                                : <span className={`text-3xl font-bold ${className}`}>{resumo[key] ?? 0}</span>
                            }
                        </div>
                    ))}
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center justify-between py-4">
                        <h2 className="text-white font-medium">Últimas solicitações</h2>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => setModalCriar(true)}
                                className="bg-tutor-accent hover:bg-tutor-accent-light text-tutor-dark font-semibold rounded-lg text-xs"
                            >
                                + Solicitação
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate('/solicitacoes')}
                                className="text-white/50 hover:text-white hover:brightness-125 text-xs"
                            >
                                Ver todas
                            </Button>
                        </div>
                    </div>

                    <div className="bg-tutor-dark-card rounded-xl p-3">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/50 px-4">Título</TableHead>
                                    <TableHead className="text-white/50 px-4 hidden lg:table-cell">Setor</TableHead>
                                    <TableHead className="text-white/50 px-4">Status</TableHead>
                                    <TableHead className="text-white/50 px-4 text-right">Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-white/5 hover:bg-transparent">
                                            <TableCell><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 bg-white/10 rounded animate-pulse w-24" /></TableCell>
                                            <TableCell><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                                            <TableCell><div className="h-4 bg-white/10 rounded animate-pulse w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : recentes.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={4} className="text-white/30 text-sm text-center py-8">
                                            Nenhuma solicitação encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentes.map((s) => (
                                        <TableRow
                                            key={s.id}
                                            onClick={() => setModalId(s.id)}
                                            className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="max-w-0">
                                                <div className="text-white text-sm truncate">{s.titulo}</div>
                                            </TableCell>
                                            <TableCell className="text-white/50 text-sm hidden sm:table-cell">
                                                {s.setor}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[s.status].className}`}>
                                                    {statusConfig[s.status].label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-white/30 text-xs text-right">
                                                {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

            </main>

            <SolicitacaoDetalhesModal
                id={modalId}
                open={modalId !== null}
                onClose={() => setModalId(null)}
                onDecisao={() => {
                    setModalId(null)
                    refetch()
                }}
            />

            <SolicitacaoCriarModal
                open={modalCriar}
                onClose={() => setModalCriar(false)}
                onCriada={refetch}
            />
        </div>
    )
}

export default DashboardPage