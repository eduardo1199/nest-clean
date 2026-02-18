import { HasherComparer } from '@/domain/forum/application/crytography/hasher-comparer'
import { HasherGenerator } from '@/domain/forum/application/crytography/hasher-generator'

import { hash, compare } from 'bcryptjs'

export class BcryptHasher implements HasherGenerator, HasherComparer {
  private PASSWORD_SALT_LENGTH = 8

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }

  hash(plain: string): Promise<string> {
    return hash(plain, this.PASSWORD_SALT_LENGTH)
  }
}
