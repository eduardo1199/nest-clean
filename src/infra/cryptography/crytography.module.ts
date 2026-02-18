import { Encrypter } from '@/domain/forum/application/crytography/encrypter'
import { Module } from '@nestjs/common'
import { JwtEncrypt } from './jwt-encrypter'
import { HasherComparer } from '@/domain/forum/application/crytography/hasher-comparer'
import { BcryptHasher } from './bcrypt-hasher'
import { HasherGenerator } from '@/domain/forum/application/crytography/hasher-generator'

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypt,
    },
    {
      provide: HasherComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HasherGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [Encrypter, HasherComparer, HasherGenerator],
})
export class CryptographyModule {}
