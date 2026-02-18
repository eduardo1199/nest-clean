import { JwtService } from '@nestjs/jwt'
import { Encrypter } from '@/domain/forum/application/crytography/encrypter'
import { Injectable } from '@nestjs/common'

@Injectable()
export class JwtEncrypt implements Encrypter {
  constructor(private JwtService: JwtService) {}

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.JwtService.signAsync(payload)
  }
}
