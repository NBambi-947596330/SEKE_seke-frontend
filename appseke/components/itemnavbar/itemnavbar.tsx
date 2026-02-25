"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/use-auth"
import { UserMenu } from "@/components/itemnavbar/user-menu"
import { lightTheme } from "@/style/light"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()

    // Ocultar navbar em páginas de autenticação
    if (pathname?.startsWith('/auth') || pathname?.startsWith('/optionregister')) {
        return null
    }

    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full z-50 top-0 ">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 ">
                <div className="flex justify-between items-center h-16">
                    {/* Logo à esquerda */}
                    <div className="shrink-0">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-green-600">Logo</span>
                        </Link>
                    </div>

                    {/* Menu central - visível apenas em desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/conexoes" 
                            className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
                        >
                            Conexões
                        </Link>
                        <Link 
                            href="/trabalhos" 
                            className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
                        >
                            Trabalhos
                        </Link>
                    </div>

                    {/* Lado direito - ícone pesquisa e botões */}
                    <div className="flex items-center gap-3">
                        {/* Ícone de pesquisa - visível em desktop */}
                        <div className="hidden md:block">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {/* Autenticado: ícones + menu utilizador; não autenticado: Login e Criar conta */}
                        <div className="hidden md:flex items-center gap-2">
                            {!isLoading && (
                                isAuthenticated ? (
                                    <UserMenu />
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => router.push('/auth/login')}
                                            variant="outline"
                                            className="hover:bg-blue-50 cursor-pointer h-12 w-30 border-none"
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            onClick={() => router.push('/auth/register')}
                                            style={{ backgroundColor: lightTheme.colors.primary }}
                                            className="cursor-pointer h-12"
                                        >
                                            Criar Conta
                                        </Button>
                                    </>
                                )
                            )}
                        </div>

                        {/* Botão do menu mobile */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Barra de pesquisa expansível */}
                {isSearchOpen && (
                    <div className="hidden md:block absolute left-0 right-0 bg-white border-b border-gray-200 p-4 shadow-lg">
                        <div className="max-w-3xl mx-auto flex gap-2">
                            <Input 
                                type="text" 
                                placeholder="O que você está procurando?" 
                                className="flex-1"
                                autoFocus
                            />
                            <Button style={{ backgroundColor: lightTheme.colors.primary}} className="">
                                Buscar
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Menu mobile */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        {/* Links do menu */}
                        <Link 
                            href="/" 
                            className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link 
                        
                            href="/conexoes" 
                            className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Conexões
                        </Link>
                        <Link 
                            href="/trabalhos" 
                            className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg text-base font-medium transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trabalhos
                        </Link>

                        {/* Barra de pesquisa mobile */}
                        <div className="relative mt-3">
                            <Input 
                                type="text" 
                                placeholder="Pesquisar..." 
                                className="w-full pl-10"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 cursor-pointer" size={18} />
                        </div>

                        {/* Botões mobile: autenticado = UserMenu; não autenticado = Login e Criar conta */}
                        <div className="flex flex-col gap-2 pt-2">
                            {!isLoading && (
                                isAuthenticated ? (
                                    <div className="flex justify-end" onClick={() => setIsMenuOpen(false)}>
                                        <UserMenu />
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full hover:bg-blue-50"
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                router.push('/auth/login')
                                            }}
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            style={{ backgroundColor: lightTheme.colors.primary }}
                                            className="w-full"
                                            onClick={() => {
                                                setIsMenuOpen(false)
                                                router.push('/auth/register')
                                            }}
                                        >
                                            Criar Conta
                                        </Button>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}