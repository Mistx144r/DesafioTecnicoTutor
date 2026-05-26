import Header from "../components/Header.tsx"
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../contexts/AuthContext'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { SolicitacaoDetalhesModal } from '../components/SolicitacaoDetalhesModal.tsx'
import { useDebounce } from '../hooks/useDebounce'

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

function SolicitacoesPage() {
    const [pagina, setPagina] = useState(1)
    const [busca, setBusca] = useState('')
    const [status, setStatus] = useState('')
    const [modalId, setModalId] = useState<number | null>(null)

    const buscaDebounced = useDebounce(busca, 400)

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['solicitacoes', pagina, buscaDebounced, status],
        queryFn: () => {
            const f = new FormData()
            f.append('pagina', String(pagina))
            if (buscaDebounced) f.append('busca', buscaDebounced)
            if (status) f.append('status', status)
            return apiFetch('/api/solicitacao/listar', { method: 'POST', body: f })
        },
    })

    const solicitacoes: Solicitacao[] = data?.ok ? data.dados.solicitacoes : []
    const total: number = data?.ok ? data.dados.total : 0
    const total_paginas: number = data?.ok ? data.dados.total_paginas : 0
    const temAnterior: boolean = data?.ok ? data.dados.tem_pagina_anterior : false
    const temProxima: boolean = data?.ok ? data.dados.tem_proxima_pagina : false

    return (
        <div className="flex flex-col w-screen h-screen bg-tutor-dark">
            <Header />

            <main className="flex-1 overflow-y-auto flex flex-col">
                <div className="flex flex-col gap-4 p-6 max-w-6xl mx-auto w-full">

                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                                placeholder="Buscar por título..."
                                value={busca}
                                onChange={(e: any) => { setBusca(e.target.value); setPagina(1) }}
                                className="bg-tutor-dark-card border-white/10 text-white placeholder:text-white/30 pl-9 py-2 rounded-full focus-visible:ring-tutor-accent"
                            />
                        </div>

                        <select
                            value={status || 'todos'}
                            onChange={(e) => { setStatus(e.target.value === 'todos' ? '' : e.target.value); setPagina(1) }}
                            className={`
                                bg-tutor-dark-card border border-white/10 rounded-lg px-4 py-2 text-sm
                                w-full sm:w-40 cursor-pointer outline-none transition-colors
                                focus:border-tutor-accent text-white
                            `}
                        >
                            <option value="todos" className="bg-tutor-dark text-white">Todos</option>
                            <option value="pendente" className="bg-tutor-dark text-amber-400">Pendente</option>
                            <option value="aprovada" className="bg-tutor-dark text-tutor-accent">Aprovada</option>
                            <option value="rejeitada" className="bg-tutor-dark text-red-400">Rejeitada</option>
                        </select>

                        <span className="text-white/30 text-sm text-right sm:text-left shrink-0">
                            {total} resultado{total !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Tabela desktop */}
                    <div className="hidden md:flex bg-tutor-dark-card rounded-xl p-3 h-auto min-h-[420px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/50 px-4">Título</TableHead>
                                    <TableHead className="text-white/50 px-4">Setor</TableHead>
                                    <TableHead className="text-white/50 px-4">Status</TableHead>
                                    <TableHead className="text-white/50 px-4 text-right">Data</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 10 }).map((_, i) => (
                                        <TableRow key={i} className="border-white/5 hover:bg-transparent">
                                            <TableCell className="px-4"><div className="h-4 bg-white/10 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 bg-white/10 rounded animate-pulse w-24" /></TableCell>
                                            <TableCell><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                                            <TableCell className="px-4"><div className="h-4 bg-white/10 rounded animate-pulse w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : solicitacoes.length === 0 ? (
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableCell colSpan={4} className="text-white/30 text-sm text-center py-16">
                                            Nenhuma solicitação encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    solicitacoes.map((s) => (
                                        <TableRow
                                            key={s.id}
                                            onClick={() => setModalId(s.id)}
                                            className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="px-4 max-w-0">
                                                <div className="text-white text-sm truncate">{s.titulo}</div>
                                            </TableCell>
                                            <TableCell className="text-white/50 text-sm px-4">{s.setor}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[s.status].className}`}>
                                                    {statusConfig[s.status].label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-white/30 text-xs text-right px-4">
                                                {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Cards mobile */}
                    <div className="md:hidden flex flex-col gap-3">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="bg-tutor-dark-card rounded-xl p-4 flex flex-col gap-2">
                                    <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                                    <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
                                </div>
                            ))
                        ) : solicitacoes.length === 0 ? (
                            <p className="text-white/30 text-sm text-center py-16">Nenhuma solicitação encontrada</p>
                        ) : (
                            solicitacoes.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => setModalId(s.id)}
                                    className="bg-tutor-dark-card rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-white text-sm font-medium truncate flex-1">{s.titulo}</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusConfig[s.status].className}`}>
                                            {statusConfig[s.status].label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/50 text-xs">{s.setor}</span>
                                        <span className="text-white/30 text-xs">{new Date(s.criado_em).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Paginação centralizada */}
                <div className="flex items-center justify-center gap-4 py-4 border-t border-white/5">
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={!temAnterior}
                        onClick={() => setPagina(p => p - 1)}
                        className="flex text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </Button>

                    <span className="text-white/30 text-lg">{total > 0 ? pagina : 0}/{total_paginas}</span>

                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={!temProxima}
                        onClick={() => setPagina(p => p + 1)}
                        className="text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg flex"
                    >
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                    </Button>
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
        </div>
    )
}

export default SolicitacoesPage