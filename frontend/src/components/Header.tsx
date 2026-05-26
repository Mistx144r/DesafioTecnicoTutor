import Logo from '../assets/Logo_White.png'
import LogoMobile from '../assets/Logo_White_Mobile.png'
import { Button } from '../../components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {useNavigate} from "react-router-dom";

function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <header className="flex w-full bg-tutor-dark-card border-b border-white/10 px-6 py-6 items-center justify-between">
            <div onClick={() => navigate("/dashboard")} className="flex flex-col text-white/70 cursor-pointer">
                <img src={Logo} className="h-[45px] hidden sm:block" alt="logo" />
                <img src={LogoMobile} className="h-[45px] sm:hidden" alt={"logo"} />
                <h3 className="text-xs">Compras</h3>
            </div>

            <div className="flex items-end justify-end flex-col-reverse md:flex-row md:items-center">
                <span className="text-white/70 text-sm">
                    Olá, <span className="text-white font-medium">{user?.nome}</span>
                </span>

                <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="flex text-white/50 hover:text-white hover:brightness-125 gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </Button>
            </div>
        </header>
    )
}

export default Header