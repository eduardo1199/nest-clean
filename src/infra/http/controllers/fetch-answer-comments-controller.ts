import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import z from 'zod'
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments'
import { CommentsPresenter } from '../presents/comments-presenter'

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>

/**
 * UseGuards: determinar se uma determinada requisição será processada pelo manipulador de rotas ou não, dependendo de certas condições (como permissões, funções, ACLs, etc.) presentes em tempo de execução.
 *
 * Ele validar se o token passado na requisição é valido
 */
@Controller('/answers/:answerId/comments')
export class FetchAnswerCommentsController {
  constructor(private fetchAnswerCommentsUseCase: FetchAnswerCommentsUseCase) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
    @Param('answerId') answerId: string,
  ) {
    const result = await this.fetchAnswerCommentsUseCase.execute({
      page,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { answerComments } = result.value

    return {
      comments: answerComments.map(CommentsPresenter.toHTTP),
    }
  }
}
