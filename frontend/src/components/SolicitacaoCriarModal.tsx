import { useState } from 'react'
import {apiFetch, useAuth} from '../contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Loader2, X, Plus, Trash2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SolicitacaoFormSchema, type SolicitacaoForm } from '../schemas'

interface Props {
    open: boolean
    onClose: () => void
    onCriada: () => void
}

const inputClass = 'w-full bg-tutor-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-tutor-accent'
const labelClass = 'text-white/40 text-xs mb-1 block'
const errorClass = 'text-red-400 text-xs mt-1'

function SolicitacaoCriarModal({ open, onClose, onCriada }: Props) {
    const [salvando, setSalvando] = useState(false)
    const auth = useAuth()

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SolicitacaoForm>({
        resolver: zodResolver(SolicitacaoFormSchema),
        defaultValues: {
            itens: [{ descricao: '', quantidade: 1, preco_estimado: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'itens' })

    const fechar = () => {
        reset()
        onClose()
    }

    const onSubmit = async (data: SolicitacaoForm) => {
        setSalvando(true)

        const formData = new FormData()
        formData.append('titulo',     data.titulo)
        formData.append('setor',      data.setor)
        formData.append('prioridade', data.prioridade)
        formData.append('itens',      JSON.stringify(data.itens))
        formData.append('criado_por', String(auth.user?.id))

        const res = await apiFetch('/api/solicitacao/criar', { method: 'POST', body: formData })
        setSalvando(false)

        if (res.ok) {
            onCriada()
            fechar()
        }
    }

    return (
        <Dialog open={open} onOpenChange={fechar}>
            <div
                className={`fixed inset-0 bg-black/70 z-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={fechar}
            />

            <DialogContent className="bg-tutor-dark-card border-white/10 text-white flex flex-col w-full md:max-w-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 overflow-hidden [&>button]:hidden">
                <DialogHeader className="w-full min-w-0">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle className="text-white font-normal truncate min-w-0">
                            Nova Solicitação
                        </DialogTitle>
                        <button onClick={fechar} className="text-white/40 hover:text-white transition-colors shrink-0">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-5 w-full min-w-0">

                        {/* Campos principais */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelClass}>Título</label>
                                <input
                                    {...register('titulo')}
                                    placeholder="Ex: Compra de equipamentos TI"
                                    className={inputClass}
                                />
                                {errors.titulo && <p className={errorClass}>{errors.titulo.message}</p>}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 min-w-0">
                                    <label className={labelClass}>Setor</label>
                                    <input
                                        {...register('setor')}
                                        placeholder="Ex: Tecnologia"
                                        className={inputClass}
                                    />
                                    {errors.setor && <p className={errorClass}>{errors.setor.message}</p>}
                                </div>

                                <div className="w-36 shrink-0">
                                    <label className={labelClass}>Prioridade</label>
                                    <select
                                        {...register('prioridade')}
                                        className={`${inputClass} appearance-none`}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Selecione</option>
                                        <option value="baixa">Baixa</option>
                                        <option value="media">Média</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                    {errors.prioridade && <p className={errorClass}>{errors.prioridade.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Itens */}
                        <div className="flex flex-col gap-3 w-full min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs">Itens</span>
                                <button
                                    type="button"
                                    onClick={() => append({ descricao: '', quantidade: 1, preco_estimado: 0 })}
                                    className="flex items-center gap-1 text-tutor-accent text-xs hover:text-tutor-accent-light transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Adicionar item
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="bg-white/5 rounded-lg p-3 flex flex-col gap-2 w-full min-w-0">
                                        <div className="flex gap-2 w-full min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <label className={labelClass}>Descrição</label>
                                                <input
                                                    {...register(`itens.${index}.descricao`)}
                                                    placeholder="Ex: Notebook Dell"
                                                    className={inputClass}
                                                />
                                                {errors.itens?.[index]?.descricao && (
                                                    <p className={errorClass}>{errors.itens[index].descricao.message}</p>
                                                )}
                                            </div>

                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-white/20 hover:text-red-400 transition-colors shrink-0 mt-5"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="w-24 shrink-0">
                                                <label className={labelClass}>Qtd.</label>
                                                <input
                                                    {...register(`itens.${index}.quantidade`, {
                                                        setValueAs: (v) => Number(v),
                                                    })}
                                                    type="number"
                                                    min={1}
                                                    placeholder="0"
                                                    className={inputClass}
                                                />
                                                {errors.itens?.[index]?.quantidade && (
                                                    <p className={errorClass}>{errors.itens[index].quantidade.message}</p>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <label className={labelClass}>Preço estimado (R$)</label>
                                                <input
                                                    {...register(`itens.${index}.preco_estimado`, {
                                                        setValueAs: (v) => Number(v),
                                                    })}
                                                    type="number"
                                                    min={0}
                                                    step={0.01}
                                                    placeholder="0,00"
                                                    className={inputClass}
                                                />
                                                {errors.itens?.[index]?.preco_estimado && (
                                                    <p className={errorClass}>{errors.itens[index].preco_estimado.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.itens?.root && (
                                <p className={errorClass}>{errors.itens.root.message}</p>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={fechar}
                                className="flex-1 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white rounded-lg px-5 py-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-tutor-accent hover:bg-tutor-accent-light text-tutor-dark font-semibold rounded-lg px-5 py-1"
                            >
                                {salvando ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Criar'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default SolicitacaoCriarModal;