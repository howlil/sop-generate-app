import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository, UserWithoutPassword } from '../repository/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PeranPengguna } from '../../../generated/prisma';
import * as bcrypt from 'bcrypt';
import { UserMessages } from '../../../common/messages';
import { generateSecurePassword } from '../../../common/utils/password.util';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepository.findByEmailWithPassword(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException(UserMessages.EMAIL_EXISTS);
    }

    // Auto-generate password if not provided
    const password = createUserDto.kataSandi || generateSecurePassword();

    // Auto-add TIM_PENYUSUN users to AnggotaTimPenyusun (must check before KOORDINATOR lock)
    const isPenyusunRole =
      createUserDto.peran === PeranPengguna.TIM_PENYUSUN;

    // [P2-D] Enforce: 1 KEPALA_OPD and 1 KOORDINATOR_TIM_PENYUSUN per OPD
    // Use transaction with SELECT FOR UPDATE to prevent race condition
    const isRoleLockRequired =
      createUserDto.peran === PeranPengguna.KEPALA_OPD ||
      createUserDto.peran === PeranPengguna.KOORDINATOR_TIM_PENYUSUN;

    if (isRoleLockRequired) {
      if (!createUserDto.opdId) {
        throw new BadRequestException(UserMessages.OPD_REQUIRED);
      }

      // Check NIP uniqueness globally
      if (createUserDto.nip) {
        const existingByNip = await this.userRepository.findByNip(createUserDto.nip);
        if (existingByNip) {
          throw new ConflictException('NIP sudah terdaftar');
        }
      }

      // Transaction with SELECT FOR UPDATE prevents concurrent creation
      return this.userRepository.createWithRoleLock(
        { ...createUserDto, kataSandi: await bcrypt.hash(password, 10) },
        createUserDto.peran,
        createUserDto.opdId,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      ...createUserDto,
      kataSandi: hashedPassword,
    });

    // Auto-add TIM_EVALUASI users to TimEvaluasiAnggota table
    if (createUserDto.peran === PeranPengguna.TIM_EVALUASI) {
      await this.userRepository.addToTimEvaluasi(user.id);
    }

    // Auto-add TIM_PENYUSUN users to AnggotaTimPenyusun table
    if (isPenyusunRole && createUserDto.opdId) {
      await this.userRepository.addToTimPenyusun(user.id, createUserDto.opdId);
    }

    return user;
  }

  async findAll(page: number, limit: number): Promise<{
    data: UserWithoutPassword[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userRepository.findAll(skip, limit),
      this.userRepository.count(),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    if (updateUserDto.email) {
      const emailExists = await this.userRepository.findByEmailWithPassword(
        updateUserDto.email,
      );
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException(UserMessages.EMAIL_ALREADY_REGISTERED);
      }
    }

    // [P2-D] Enforce role constraint when changing to KEPALA_OPD or KOORDINATOR
    if (
      updateUserDto.peran &&
      (updateUserDto.peran === PeranPengguna.KEPALA_OPD ||
        updateUserDto.peran === PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
    ) {
      if (!updateUserDto.opdId) {
        throw new BadRequestException(UserMessages.OPD_REQUIRED);
      }

      // Check if another user already has this role in the OPD
      const existing = await this.userRepository.findActiveRoleInOpd(
        updateUserDto.peran,
        updateUserDto.opdId,
      );

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `OPD ini sudah memiliki ${updateUserDto.peran} aktif`,
        );
      }
    }

    if (updateUserDto.kataSandi) {
      updateUserDto.kataSandi = await bcrypt.hash(updateUserDto.kataSandi, 10);
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    // [P1-G]: repository.delete() deactivates active team memberships atomically before soft-delete
    await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.kataSandi);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      nama: user.nama,
      peran: user.peran,
      opdId: user.opdId,
      nip: user.nip,
      jabatan: user.jabatan,
      pangkat: user.pangkat,
      nohp: user.nohp,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }
}
