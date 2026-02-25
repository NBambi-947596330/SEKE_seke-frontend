'use client';
import Image from "next/image";
import ItemBookingCard from "@/components/itemBookingCard/itemBookingCard";
import ItemHeaderviews from "@/components/itemheadviews/itemheaderviews";
import PortfolioGallery from "@/components/itemPortfolioGallery/itemPortfolioGallery";
import CategoryTable from "@/components/itemavalicao/itemavaliacao";
import ClientReviews from "@/components/itemavalicao/itemavaliacao";

const portfolioItems = [
    { id: 1, src: '/postheaderimagem.png', alt: 'Consultoria UX - Projeto Dashboard', width: 1200, height: 900 },
    { id: 2, src: '/postheaderimagem.png', alt: 'Estratégia de Design - App Mobile', width: 800, height: 800 },
    { id: 3, src: '/postheaderimagem.png', alt: 'Website Redesign - E-commerce', width: 1000, height: 1200 },
    { id: 4, src: '/postheaderimagem.png', alt: 'Design System - Componentes', width: 900, height: 600 },
    { id: 5, src: '/postheaderimagem.png', alt: 'Pesquisa com Usuários', width: 1200, height: 800 },
    { id: 6, src: '/postheaderimagem.png', alt: 'Prototipação Interativa', width: 800, height: 1000 },
];

type Cliente =
    | { tipo: 'imagem'; src: string; alt: string; iniciais: string }
    | { tipo: 'iniciais'; nome: string; iniciais: string; cor: string }
    | { tipo: 'contador'; quantidade: number; iniciais: string };

const clientes: Cliente[] = [
    { tipo: 'imagem', src: '/postheaderimagem.png', alt: 'Maria Silva', iniciais: 'MS' },
    { tipo: 'iniciais', nome: 'João Santos', iniciais: 'JS', cor: 'from-green-500 to-teal-500' },
    { tipo: 'imagem', src: '/postheaderimagem.png', alt: 'Ana Oliveira', iniciais: 'AO' },
    { tipo: 'contador', quantidade: 47, iniciais: '+47' },
];

export default function Page() {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 py-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                {/* ESQUERDA - maior - sempre por cima em mobile */}
                <div className="lg:col-span-2 order-1 space-y-8 lg:space-y-10 mt-5">
                    <ItemHeaderviews />

                    {/* Seção de portfólio com título */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                Portfólio em Destaque
                            </h2>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {portfolioItems.length} projetos
                            </span>
                        </div>

                        <PortfolioGallery items={portfolioItems} mainImageIndex={2} />
                    </div>

                    {/* Seção adicional de habilidades/bio (opcional) */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Sobre o profissional
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Especialista em UX/UI com mais de 8 anos de experiência em projetos de transformação digital.
                            Trabalho com empresas como Google, Nubank e iFood, ajudando a criar experiências digitais memoráveis
                            e centradas no usuário.
                        </p>
                    </div>
                </div>

                {/* DIREITA - menor - sempre por baixo em mobile */}
                <div className="lg:col-span-1 order-2 lg:sticky lg:top-24 lg:self-start space-y-6">
                    <ItemBookingCard />

                    {/* Mini seção de confiança */}
                    <div className="bg-linear-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex -space-x-2">
                                {clientes.map((cliente, index) => (
                                    <div key={index}>
                                        {cliente.tipo === 'imagem' && (
                                            <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-linear-to-br from-gray-300 to-gray-400">
                                                <Image
                                                    src={cliente.src}
                                                    alt={cliente.alt}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        {cliente.tipo === 'iniciais' && (
                                            <div className={`w-8 h-8 rounded-full bg-linear-to-br ${cliente.cor} border-2 border-white flex items-center justify-center text-white text-xs font-medium`}>
                                                {cliente.iniciais}
                                            </div>
                                        )}

                                        {cliente.tipo === 'contador' && (
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-900 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                                                {cliente.iniciais}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="font-medium">
                                +50 clientes satisfeitos
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <ClientReviews
                averageRating={4.9}
                totalReviews={124}
                distribution={[
                    { stars: 5, percentage: 72 },
                    { stars: 4, percentage: 10 },
                    { stars: 3, percentage: 2 },
                    { stars: 2, percentage: 0 },
                    { stars: 1, percentage: 0 },
                ]}
            />
        </main>
    )
}