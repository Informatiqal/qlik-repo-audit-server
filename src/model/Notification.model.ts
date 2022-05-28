import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table
export class Notification extends Model {
  @Column({ type: DataType.STRING })
  host: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  objectId: string;

  @Column({ type: DataType.STRING })
  objectType: string;

  @Column({ type: DataType.STRING })
  objectName: string;

  @Column({ type: DataType.STRING })
  changeType: string;

  @Column({ type: DataType.STRING })
  modifiedBy: string;

  @Column({ type: DataType.TEXT })
  data: string;
}
