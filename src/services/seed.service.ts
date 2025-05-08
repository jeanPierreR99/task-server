import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';
import { Category } from 'src/entities/category.entity';
import { Office, Project } from 'src/entities';
import { TicketCounter } from 'src/entities/ticketCounter.entity';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
        @InjectRepository(TicketCounter)
        private readonly counterRepo: Repository<TicketCounter>,
        @InjectRepository(Office)
        private readonly officeRepo: Repository<Office>,

    ) { }

    async run() {
        await this.createAdminRoleAndUser();
        await this.initTicketCounter();
        await this.initOffices();

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
        // Crear proyecto por defecto si no existe
        let defaultProject = await this.projectRepo.findOne({ where: { name: 'Otros' } });

        if (!defaultProject) {
            defaultProject = this.projectRepo.create({
                name: 'Otros',
                description: 'Proyecto por defecto del administrador',
            });
            await this.projectRepo.save(defaultProject);
            this.logger.log('Proyecto "Otros" creado.');
        }

        // Crear usuario admin
        const adminUser = this.userRepo.create({
            name: 'Admin',
            email: adminEmail,
            telephone: 123456789,
            passwordHash: "$2a$10$od.a8J8pm/dgtaIyNJcZ5.Nfs8V/UQel6XN889t.IhoxwS7G8pKV.",
            roleId: adminRole.id,
            projectId: defaultProject.id, // Aquí asignamos el proyecto
            imageUrl: "",
            active: true,
        });

        const savedUser = await this.userRepo.save(adminUser);

        // Crear carpeta del proejcto
        const uploadBasePath = path.join(__dirname, '..', '..', 'uploads');
        const userFolder = path.join(uploadBasePath, defaultProject.id);

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
            this.logger.log(`Carpeta creada para el proyecto ${defaultProject.id}`);
        }

        // Crear categoría por defecto
        const defaultCategory = this.categoryRepo.create({
            title: 'Añadidas recientes',
            project: defaultProject,
            index: true,
        });
        await this.categoryRepo.save(defaultCategory);
        this.logger.log(`Categoría "Añadidas recientes" creada para el proyecto ${savedUser.id}`);

        return savedUser;
    }

    private async initTicketCounter() {
        const exists = await this.counterRepo.findOne({ where: { id: 1 } });

        if (!exists) {
            await this.counterRepo.save({ id: 1, lastNumber: 0 });
            this.logger.log('Contador de tickets inicializado.');
        } else {
            this.logger.log('Contador de tickets ya existe.');
        }
    }

    private async initOffices() {
        const offices = [
            { name: 'CONSEJO MUNICIPAL', siglas: 'CM' },
            { name: 'COMISIONES DE REGIDORES', siglas: 'CR' },
            { name: 'ALCALDÍA', siglas: 'A' },
            { name: 'PROCURADURÍA PÚBLICA MUNICIPAL', siglas: 'PPM' },
            { name: 'INSTITUTO VIAL PROVINCIAL(IVP)', siglas: 'IVP' },
            { name: 'ORGANO DE CONTROL INSTITUCIONAL', siglas: 'OCI' },
            { name: 'SECRETARIA GENERAL', siglas: 'SG' },
            { name: 'OFICINA DE TRÁMITE DOCUMENTARIO', siglas: 'OTD' },
            { name: 'DEPARTAMENTO DE ARCHIVO CENTRAL', siglas: 'DAC' },
            { name: 'OFICINA DE IMAGEN INSTITUCIONAL', siglas: 'OII' },
            { name: 'GERENCIA MUNICIPAL', siglas: 'GM' },
            { name: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', siglas: 'OGAF' },
            { name: 'OFICINA DE PERSONAL', siglas: 'OP' },
            { name: 'OFICINA DE TESORERÍA', siglas: 'OT' },
            { name: 'OFICINA DE CONTABILIDAD', siglas: 'OC' },
            { name: 'OFICINA DE ABASTECIMIENTO', siglas: 'OA' },
            { name: 'COTIZACIONES', siglas: 'OA.COTIZACIONES' },
            { name: 'ADQUISICIONES', siglas: 'OA.ADQUISICIONES' },
            { name: 'PROCESOS', siglas: 'OA.PROCESOS' },
            { name: 'OFICINA GENERAL DE PLANEAMIENTO Y PRESUPUESTO', siglas: 'OGPP' },
            { name: 'OFICINA DE PLANEAMIENTO Y MODERNIZACIÓN', siglas: 'OPM' },
            { name: 'OFICINA DE PRESUPUESTO', siglas: 'OPR' },
            { name: 'OFICINA DE PROGRAMACIÓN MULTIANUAL DE INVERSIONES', siglas: 'OPMI' },
            { name: 'OFICINA DE TECNOLOGÍAS DE LA INFORMACIÓN', siglas: 'OTI' },
            { name: 'OFICINA DE FORMULACIÓN DE INVERSIONES', siglas: 'OFI' },
            { name: 'OFICINA GENERAL DE ASESORÍA JURÍDICA', siglas: 'OGAJ' },
            { name: 'UNIDAD DE GESTIÓN DE RESIDUOS SÓLIDOS', siglas: 'UGRS' },
            { name: 'MUNICIPALIDAD DE CENTROS POBLADOS', siglas: 'MCP' },
            { name: 'GERENCIA DE DESARROLLO URBANO Y RURAL', siglas: 'GDUR' },
            { name: 'SUBGERENCIA DE PLANEAMIENTO Y ACONDICIONAMIENTO TERRITORIAL', siglas: 'SGPAT' },
            { name: 'SUBGERENCIA DE CATASTRO', siglas: 'SGC' },
            { name: 'SUBGERENCIA DE OBRAS', siglas: 'SGO' },
            { name: 'SUBGERENCIA DE ESTUDIOS Y PROYECTOS DE INVERSIÓN', siglas: 'SGEPI' },
            { name: 'SUBGERENCIA DE SUPERVISIÓN Y LIQUIDACIÓN DE OBRAS', siglas: 'SGSLO' },
            { name: 'SUBGERENCIA DE OPERACIÓN Y MANTENIMIENTO DE VIAS URBANAS Y RURALES', siglas: 'SGOMVUR' },
            { name: 'GERENCIA DE DESARROLLO ECONÓMICO LOCAL', siglas: 'GDEL' },
            { name: 'SUBGERENCIA DE PROMOCIÓN EMPRESARIAL Y COMERCIALIZACIÓN', siglas: 'SGPEC' },
            { name: 'SUBGERENCIA DE TURISMO', siglas: 'SGT' },
            { name: 'GERENCIA DE DESARROLLO SOCIAL', siglas: 'GDS' },
            { name: 'SUBGERENCIA DE PROGRAMAS SOCIALES', siglas: 'SGPS' },
            { name: 'SUBGERENCIA DE EDUCACIÓN, CULTURA Y DEPORTE', siglas: 'SGECD' },
            { name: 'OFICINA DE REGISTRO CIVIL', siglas: 'ORC' },
            { name: 'SUBGERENCIA DE COMUNIDADES NATIVAS Y PARTICIPACIÓN CIUDADANA', siglas: 'SGCNPC' },
            { name: 'SUBGERENCIA DE SALUD Y SALUBRIDAD', siglas: 'SGSS' },
            { name: 'GERENCIA DE GESTIÓN AMBIENTAL', siglas: 'GGA' },
            { name: 'SUBGERENCIA DE MEDIO AMBIENTE', siglas: 'SGMA' },
            { name: 'SUBGERENCIA DE ORNATO, PARQUES Y JARDINES', siglas: 'SGOPJ' },
            { name: 'GERENCIA DE SEGURIDAD CIUDADANA Y GESTIÓN DE RIESGOS', siglas: 'GSCGR' },
            { name: 'SUBGERENCIA DE SEGURIDAD VIAL Y TRÁNSITO', siglas: 'SGSVT' },
            { name: 'SUBGERENCIA DE SERENAZGO', siglas: 'SGS' },
            { name: 'SUBGERENCIA DE GESTIÓN DE RIESGO DE DESASTRES', siglas: 'SGGRD' },
            { name: 'GERENCIA DE RENTAS Y ADMINISTRACIÓN TRIBUTARIA', siglas: 'GRAT' },
            { name: 'SUBGERENCIA DE REGISTRO Y CONTROL TRIBUTARIO', siglas: 'SGRCT' },
            { name: 'SUBGERENCIA DE RECAUDACIÓN', siglas: 'SGR' },
            { name: 'SUBGERENCIA DE FISCALIZACIÓN TRIBUTARIA', siglas: 'SGFT' },
            { name: 'SUBGERENCIA DE EJECUTORIA COACTIVA', siglas: 'SGEC' },
            { name: 'GERENCIA DE FISCALIZACIÓN Y CONTROL', siglas: 'GFC' },
            { name: 'SUBGERENCIA DE OPERACIONES Y FISCALIZACIÓN', siglas: 'SGOF' },
            { name: 'SUBGERENCIA DE SANCIONES Y CONTROL', siglas: 'SGSC' },
        ];

        for (const office of offices) {
            const exists = await this.officeRepo.findOne({ where: { siglas: office.siglas } });
            if (!exists) {
                await this.officeRepo.save(this.officeRepo.create(office));
                this.logger.log(`Oficina creada: ${office.name} (${office.siglas})`);
            }
        }
    }



}
