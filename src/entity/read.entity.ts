import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Read {
    @PrimaryGeneratedColumn("uuid")
    measure_uuid!: string;

    @Column()
    customer_code!: string;

    @Column()
    measure_datetime!: string;
    
    @Column()
    measure_type!: string;
    
    @Column()
    measure_value!: number;
    
    @Column({type:'boolean', default: false})
    has_confirmed!: boolean;

    @Column()
    image_url!: string;
}
