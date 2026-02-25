import { lightTheme } from "@/style/light"
import { CheckCircle, Clock, MapPin, Star } from "lucide-react"
import Image from "next/image"

export default function ItemHeaderviews() {
    return (
        <div className="w-full bg-[#f3f4f6] rounded-xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-4">

            {/* LEFT SIDE */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full md:w-auto">

                {/* Avatar - CORRIGIDO: container com overflow-hidden e rounded-full */}
                {/* Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 mx-auto sm:mx-0">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md ring-1 ring-gray-200/50">
                        <Image
                            src="/imagemcliente.png"
                            alt="Alex Sterling"
                            fill
                            sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                            className="object-cover object-center scale-105 transition-transform duration-300 hover:scale-110"
                            priority
                            quality={85} // melhora nitidez em avatares pequenos
                        />
                    </div>

                    {/* Badge online */}
                    <span 
                    style={{  backgroundColor: lightTheme.colors.primary,}}
                    
                    className="absolute -bottom-0.5 -right-0.5 sm:bottom-0 sm:right-0 w-5 h-5 sm:w-6 sm:h-6 border-4 border-white rounded-full shadow-sm z-10" />
                </div>
                {/* Info */}
                <div className="flex flex-col gap-2 sm:gap-3 text-center sm:text-left w-full">

                    {/* Name + verified */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                            Alex Sterling
                        </h2>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#18B481] fill-[#18B481] shrink-0" />
                    </div>

                    <p className="text-sm sm:text-base text-gray-600">
                        Senior UX Consultant & Strategist
                    </p>

                    {/* Availability & Location */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-start">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-500 text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span>Disponível</span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 text-gray-500 text-xs sm:text-sm">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span>São Paulo, BR</span>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-1 sm:pt-2 flex-wrap">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400"
                                />
                            ))}
                        </div>

                        <span className="text-gray-800 font-medium text-xs sm:text-sm">
                            4.9
                        </span>
                        <span className="text-gray-500 text-xs sm:text-sm">
                            (124 avaliações)
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-col gap-4 text-center md:text-right text-xs sm:text-sm text-gray-600 border-t md:border-t-0 pt-4 md:pt-0">
                <div>
                    <p className="text-gray-500">Taxa de resposta</p>
                    <p className="text-gray-900 font-semibold">100%</p>
                </div>

                <div>
                    <p className="text-gray-500">Projetos</p>
                    <p className="text-gray-900 font-semibold">300+</p>
                </div>

                <div>
                    <p className="text-gray-500">Membro</p>
                    <p className="text-gray-900 font-semibold">2025</p>
                </div>
            </div>
        </div>
    )
}