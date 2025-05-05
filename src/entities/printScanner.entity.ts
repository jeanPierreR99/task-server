import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('prints_scanners')
export class PrintScanner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true })
  sedes: string;

  @Column({ length: 100, nullable: true })
  oficina: string;

  @Column({ name: 'oficina_especifica', length: 100, nullable: true })
  oficinaEspecifica: string;

  @Column({ name: 'cod_patrimonial', length: 100, nullable: true })
  codPatrimonial: string;

  @Column({ length: 100, nullable: true })
  serie: string;

  @Column({ length: 100, nullable: true })
  marca: string;

  @Column({ length: 100, nullable: true })
  tipo: string;

  @Column({ length: 100, nullable: true })
  modelo: string;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ length: 50, nullable: true })
  mac: string;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ length: 50, nullable: true })
  estado: string;
}
