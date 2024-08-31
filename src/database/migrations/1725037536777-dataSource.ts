import { MigrationInterface, QueryRunner } from "typeorm";

export class DataSource1725037536777 implements MigrationInterface {
    name = 'DataSource1725037536777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "read" ("measure_uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_code" character varying NOT NULL, "measure_datetime" character varying NOT NULL, "measure_type" character varying NOT NULL, "measure_value" integer NOT NULL, "has_confirmed" boolean NOT NULL DEFAULT false, "image_url" character varying NOT NULL, CONSTRAINT "PK_2ad33f57decb1006b62fa95ebaa" PRIMARY KEY ("measure_uuid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "read"`);
    }

}
