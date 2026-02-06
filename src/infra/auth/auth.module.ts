import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Env } from '@/infra/env'
import { JWTStrategy } from './jwt.strategy'

/**
 * Aqui as autenticações são feitas de forma base com JWT TOKEN
 *
 * JwtModule recebe um registerAsync com inject, sendo inject a injeção das configurações do service
 * global: true indicando que ele pode ser acessado nos demais módulos
 */

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<Env, true>) {
        /**
         * Aqui basicamente config captura o arquivo de variáveis .env e prover para adicionar nos parâmetros das chaves public e privada com algoritmo RS256
         */

        const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true })
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

        return {
          signOptions: {
            algorithm: 'RS256',
          },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
  ],
  providers: [JWTStrategy],
})
export class AuthModule {}
