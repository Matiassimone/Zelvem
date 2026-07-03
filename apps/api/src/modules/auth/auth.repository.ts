import { Injectable } from '@nestjs/common'
import { err, ok, type Result } from 'neverthrow'

import { AppError } from '@zelvem/core'
import { getDb, type User } from '@zelvem/database'

@Injectable()
export class AuthRepository {
  // ponytail: Community — single shared DB, any id resolves the same client.
  // Hosted needs a control-plane user registry (user -> logical DB) before launch.
  private readonly db = getDb('community')

  /** Looks up a user by email for credential verification. */
  async findByEmail(email: string): Promise<Result<User, AppError>> {
    const user = await this.db.user.findUnique({ where: { email } })
    return user ? ok(user) : err(new AppError('USER_NOT_FOUND'))
  }
}
