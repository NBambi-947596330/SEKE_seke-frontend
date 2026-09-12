import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { lightTheme } from "@/style/light"
import Link from "next/link"

export function ItemForgotPassword() {
    return (

        <Card style={{
            padding: lightTheme.spacing.md,
            borderRadius: lightTheme.borderRadius.small,
            border: `1px solid ${lightTheme.colors.border}`,
            fontFamily: lightTheme.typography.fontFamily,
        }}>
            <CardHeader className="gap-2 md:mt-6">
                <CardTitle className="text-2xl">Redefinir senha</CardTitle>
                <CardDescription className="text-muted-foreground" style={{
                    fontSize: lightTheme.typography.fontSize.small

                }}>
                    Defina uma nova senha para voltar a aceder à sua conta e
                    continuar a encontrar os profissionais certos para os seus
                    serviços.
                </CardDescription>

            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Nova Senha</Label>
                            <PasswordInput
                                id="email"
                                placeholder="Nova Senha"
                                style={{ border: `1px solid ${lightTheme.colors.border}`, }}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Confirmar Senha</Label>
                            </div>
                            <PasswordInput id="password" placeholder="Confirmar senha" required style={{
                                border: `1px solid ${lightTheme.colors.border}`,
                                outlineColor: lightTheme.colors.primary
                            }} />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full cursor-pointer text-white h-10" style={{ backgroundColor: lightTheme.colors.primary, }}>
                    Atualizar senha
                </Button>
                <p className="mt-6">
                    <Link href="/auth/login" className="text-primary">Voltar para o login</Link>
                </p>
            </CardFooter>
        </Card>

    )
}