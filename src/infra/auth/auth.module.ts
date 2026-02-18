import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JWTStrategy } from './jwt.strategy'
import { APP_GUARD } from '@nestjs/core'
import { JWTAuthGuard } from './jwt-auth-guard'
import { EnvService } from '@/infra/env/env.service'
import { EnvModule } from '../env/env.module'

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
      inject: [EnvService],
      global: true,
      imports: [EnvModule],
      useFactory(config: EnvService) {
        /**
         * Aqui basicamente config captura o arquivo de variáveis .env e prover para adicionar nos parâmetros das chaves public e privada com algoritmo RS256
         */

        const privateKey = config.get('JWT_PRIVATE_KEY')
        const publicKey = config.get('JWT_PUBLIC_KEY')

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
  providers: [
    JWTStrategy,
    EnvService,
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
  ],
})
export class AuthModule {}
