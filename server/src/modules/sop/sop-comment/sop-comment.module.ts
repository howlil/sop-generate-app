import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { SopCommentController } from './sop-comment.controller';
import { SopCommentRepository } from './sop-comment.repository';
import { SopCommentService } from './sop-comment.service';

/** Komentar SOP — kanal evaluator menulis catatan; penyusun menandai selesai. */
@Module({
  imports: [AuthModule],
  controllers: [SopCommentController],
  providers: [SopCommentService, SopCommentRepository],
})
export class SopCommentModule {}
