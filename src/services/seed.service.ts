import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';
import { Category } from 'src/entities/category.entity'; // Asegúrate de que Category esté importado

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Category) // Inyectamos el repositorio de Category
        private readonly categoryRepo: Repository<Category>,
    ) { }

    async run() {
        await this.createAdminRoleAndUser();
    }

    private async createAdminRoleAndUser() {
        let adminRole = await this.roleRepo.findOne({ where: { name: 'Administrador' } });

        if (!adminRole) {
            adminRole = this.roleRepo.create({ name: 'Administrador' });
            await this.roleRepo.save(adminRole);
            this.logger.log('Rol de Administrador creado.');
        }

        const adminEmail = 'admin@example.com';
        const existingAdmin = await this.userRepo.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            await this.createAdminUser(adminEmail, adminRole);
            this.logger.log('Usuario administrador creado.');
        }
    }

    private async createAdminUser(adminEmail: string, adminRole: Role) {

        const adminUser = this.userRepo.create({
            name: 'Admin',
            email: adminEmail,
            telephone: 123456789,
            passwordHash: "$2a$10$od.a8J8pm/dgtaIyNJcZ5.Nfs8V/UQel6XN889t.IhoxwS7G8pKV.",
            roleId: adminRole.id,
            imageUrl: "",
            active: true,
        });

        const savedUser = await this.userRepo.save(adminUser);

        // Crear carpeta del usuario
        const uploadBasePath = path.join(__dirname, '..', '..', 'uploads');
        const userFolder = path.join(uploadBasePath, savedUser.id);

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
            this.logger.log(`Carpeta creada para el usuario ${savedUser.id}`);
        }

        // Crear categoría por defecto
        const defaultCategory = this.categoryRepo.create({
            title: 'Añadidas recientes',
            user: savedUser,
            index: true,
        });
        await this.categoryRepo.save(defaultCategory);
        this.logger.log(`Categoría "Añadidas recientes" creada para el usuario ${savedUser.id}`);

        return savedUser;
    }
}
