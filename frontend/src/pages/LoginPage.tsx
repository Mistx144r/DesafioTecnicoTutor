import Logo from '../assets/Logo_Dark.png'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const schema = z.object({
    email: z.string().email('E-mail inválido').max(120, "E-mail muito grande."),
    senha: z.string().min(1, 'Senha obrigatória').max(60, "Senha muito grande."),
})

type FormData = z.infer<typeof schema>
function LoginPage() {
    const [loading, setLoading] = useState(false)
    const { checkAuth } = useAuth()

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('email', data.email)
            formData.append('senha', data.senha)

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })

            const result = await response.json()

            if (!result.ok) {
                toast.error(result.erro)
                return
            }

            await checkAuth()
        } catch {
            toast.error('Erro ao conectar com o servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex w-screen h-screen bg-tutor-dark justify-center items-center select-none">
            <div className="flex flex-col items-center gap-6 w-full max-w-[400px] px-6">
                <img src={Logo} className="h-[70px mb-3" alt="logo" />

                <div className="w-full bg-tutor-dark-card/45 rounded-lg p-8 flex flex-col gap-6 shadow-xl">

                    <h1 className="text-white text-2xl font-bold text-center tracking-tight">
                        Seja-bem vindo de volta!
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                E-mail
                            </Label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="seu@email.com"
                                className="bg-tutor-white/10 border-transparent text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-tutor-accent h-12 rounded-lg px-4 transition-all"
                            />
                            {errors.email && (
                                <span className="text-red-400 text-xs">{errors.email.message}</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                Senha
                            </Label>
                            <Input
                                {...register('senha')}
                                type="password"
                                placeholder="••••••••"
                                className="bg-tutor-white/10 border-transparent text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-tutor-accent h-12 rounded-lg px-4 transition-all"
                            />
                            {errors.senha && (
                                <span className="text-red-400 text-xs">{errors.senha.message}</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-tutor-accent hover:brightness-125 text-tutor-dark font-bold rounded-full uppercase tracking-widest text-sm transition-all mt-2"
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 ml-auto mr-auto animate-spin" />
                                : 'Entrar'
                            }
                        </Button>
                    </form>

                    <p className="text-center text-white/40 text-xs">
                        Tutor Fiscal — Cursos e Sistemas
                    </p>

                </div>
            </div>
        </div>
    )
}

export default LoginPage