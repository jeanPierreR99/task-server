import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from 'src/dto/role.dto';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async create(data: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOneBy({ name: data.name });
    if (existing) {
      throw new Error('El rol ya existe');
    }

    const role = this.roleRepository.create(data);

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<{ id: string; name: string; userCount: number }[]> {
    const roles = await this.roleRepository
      .createQueryBuilder("role")
      .leftJoin("role.users", "user")
      .select("role.id", "id")
      .addSelect("role.name", "name")
      .addSelect("COUNT(user.id)", "userCount")
      .groupBy("role.id")
      .addGroupBy("role.name")
      .getRawMany();

    return roles.map(role => ({
      ...role,
      userCount: Number(role.userCount),
    }));
  }

}
