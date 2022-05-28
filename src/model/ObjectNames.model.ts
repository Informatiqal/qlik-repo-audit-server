import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export class ObjectNames extends Model {
  @Column({ type: DataType.STRING, primaryKey: true, allowNull: false })
  objectId: string;

  @Column({ type: DataType.STRING })
  objectName: string;

  @Column({ type: DataType.STRING })
  objectType: string;

  @Column({ type: DataType.STRING })
  server: string;
}
