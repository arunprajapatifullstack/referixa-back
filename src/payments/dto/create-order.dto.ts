import { IsIn, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsIn(['pro', 'enterprise'])
  plan: string;
}
