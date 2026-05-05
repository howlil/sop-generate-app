import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { SopCommentController } from './sop-comment.controller';
import { SopCommentRepository } from './sop-comment.repository';
import { SopCommentService } from './sop-comment.service';

/** Komentar SOP — umpan balik penyusun; entri dari evaluator dibuat otomatis saat evaluasi (Perlu perbaikan). */
@Module({
  imports: [AuthModule],
  controllers: [SopCommentController],
  providers: [SopCommentService, SopCommentRepository],
  exports: [SopCommentRepository],
})
export class SopCommentModule {}
